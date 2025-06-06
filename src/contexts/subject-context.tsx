
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';

// Tipos
export type Subject = {
  id: string;
  name: string;
  color: string;
  code: string;
  professor_id: string | null;
  professorIds?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type SubjectContextType = {
  subjects: Subject[];
  isLoading: boolean;
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubject: (id: string) => Subject | undefined;
  refreshSubjects: () => Promise<void>;
  getSubjectByCode?: (code: string) => Subject | undefined;
  validateCode: (code: string) => boolean;
  codeExists: (code: string, excludeId?: string) => boolean;
  assignProfessorToSubject: (subjectId: string, professorId: string) => Promise<void>;
  removeProfessorFromSubject: (subjectId: string, professorId: string) => Promise<void>;
  getProfessorsForSubject: (subjectId: string) => string[];
};

// Crear contexto
const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

// Provider
export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // En el SubjectProvider

  // Validador de código de materia (formato: letras + números, como SCA1002)
  const validateCode = (code: string): boolean => {
    // Formato básico: letras al inicio, seguidas de números (como SCA1002)
    const codeRegex = /^[A-Z]{2,4}\d{3,4}$/;

    const cleanCode = code.toUpperCase().trim();
    return codeRegex.test(cleanCode);
  };

  // Función para verificar si un código ya existe
  const codeExists = (code: string, excludeId?: string): boolean => {
    if (!code) return false;
    const cleanCode = code.toUpperCase().trim();
    return subjects.some(subj =>
      subj.code?.toUpperCase() === cleanCode && subj.id !== excludeId
    );
  };

  // Buscar materia por código
  const getSubjectByCode = (code: string): Subject | undefined => {
    if (!code) return undefined;
    const cleanCode = code.toUpperCase().trim();
    return subjects.find(subject => subject.code?.toUpperCase() === cleanCode);
  };

  const refreshSubjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      const subjectIds = data.map(subject => subject.id);
      const professorsBySubject = await loadSubjectProfessors(subjectIds);

      const formattedSubjects: Subject[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        code: item.code || '',
        professor_id: item.professor_id,
        professorIds: professorsBySubject[item.id] || [],
        description: item.description,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error('Error refreshing subjects:', error);
    }
  };

  const loadSubjectProfessors = async (subjectIds: string[]) => {
    if (!user || subjectIds.length === 0) return {};

    const { data, error } = await supabase
      .from('professor_subjects')
      .select('professor_id, subject_id')
      .in('subject_id', subjectIds);

    if (error) {
      console.error('Error al cargar relaciones profesor-materia:', error);
      return {};
    }

    // Agrupar los profesores por materia
    const professorsBySubject: Record<string, string[]> = {};
    data.forEach(relation => {
      if (!professorsBySubject[relation.subject_id]) {
        professorsBySubject[relation.subject_id] = [];
      }
      professorsBySubject[relation.subject_id].push(relation.professor_id);
    });

    return professorsBySubject;
  };

  // Asignar profesor a materia
  const assignProfessorToSubject = async (subjectId: string, professorId: string) => {
    if (!user || !professorId) return;

    try {
      const { error } = await supabase
        .from('professor_subjects')
        .insert([
          {
            professor_id: professorId,
            subject_id: subjectId,
            user_id: user.id
          }
        ]);

      if (error) {
        // Si ya existe la relación, ignoramos el error
        if (error.code === '23505') { // Error de duplicado
          return;
        }
        throw error;
      }

      setSubjects(subjects.map(subject => {
        if (subject.id === subjectId) {
          const updatedProfessorIds = [...new Set([...subject.professorIds, professorId])];
          return {
            ...subject,
            professorIds: updatedProfessorIds,
            // Mantener compatibilidad con el campo professor_id
            professor_id: subject.professor_id || professorId
          };
        }
        return subject;
      }));
    } catch (error) {
      console.error('Error al asignar profesor a materia:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el profesor a la materia",
        variant: "destructive",
      });
    }
  };

  // Eliminar profesor de materia
  const removeProfessorFromSubject = async (subjectId: string, professorId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('professor_subjects')
        .delete()
        .eq('professor_id', professorId)
        .eq('subject_id', subjectId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setSubjects(subjects.map(subject => {
        if (subject.id === subjectId) {
          const updatedProfessorIds = subject.professorIds.filter(id => id !== professorId);
          return {
            ...subject,
            professorIds: updatedProfessorIds,
            // Ajustar professor_id si el profesor removido era el principal
            professor_id: subject.professor_id === professorId
              ? (updatedProfessorIds.length > 0 ? updatedProfessorIds[0] : null)
              : subject.professor_id
          };
        }
        return subject;
      }));

      // Si era el profesor principal, actualizar en la base de datos
      const subjectToUpdate = subjects.find(s => s.id === subjectId);
      if (subjectToUpdate && subjectToUpdate.professor_id === professorId) {
        const newProfessorId = subjectToUpdate.professorIds.filter(id => id !== professorId)[0] || null;

        await supabase
          .from('subjects')
          .update({ professor_id: newProfessorId })
          .eq('id', subjectId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error al eliminar profesor de materia:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el profesor de la materia",
        variant: "destructive",
      });
    }
  };

  // Obtener profesores de una materia
  const getProfessorsForSubject = (subjectId: string): string[] => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.professorIds : [];
  };

  // Cargar materias desde Supabase
  useEffect(() => {
    async function loadSubjects() {
      if (!user) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const subjectIds = data.map(subject => subject.id);
        const professorsBySubject = await loadSubjectProfessors(subjectIds);

        const formattedSubjects: Subject[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          color: item.color,
          code: item.code || '',
          professor_id: item.professor_id,
          professorIds: professorsBySubject[item.id] || [],
          description: item.description,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setSubjects(formattedSubjects);
      } catch (error) {
        console.error('Error al cargar materias:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las materias",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();
  }, [user, toast]);

  // Añadir materia
  const addSubject = async (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      if (!subject.code || !validateCode(subject.code)) {
        toast({
          title: "Error en código",
          description: "El código de materia no tiene un formato válido.",
          variant: "destructive",
        });
        return;
      }

      // Verificar si el código ya existe
      if (codeExists(subject.code)) {
        toast({
          title: "Código duplicado",
          description: "Ya existe una materia con este código.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase
        .from('subjects')
        .insert([
          {
            name: subject.name,
            code: subject.code.toUpperCase().trim(),
            color: subject.color,
            professor_id: subject.professor_id,
            description: subject.description,
            user_id: user.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const newSubject: Subject = {
          id: data[0].id,
          name: data[0].name,
          code: data[0].code || '',
          color: data[0].color,
          professor_id: data[0].professor_id,
          professorIds: [],
          description: data[0].description,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };

        setSubjects([newSubject, ...subjects]);

        if (subject.professorIds && subject.professorIds.length > 0) {
          for (const profId of subject.professorIds) {
            await assignProfessorToSubject(newSubject.id, profId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          setSubjects(prev => prev.map(s =>
            s.id === newSubject.id
              ? { ...s, professorIds: subject.professorIds || [] }
              : s
          ));
        }

        toast({
          title: "Materia creada",
          description: `La materia "${subject.name}" ha sido creada exitosamente.`,
        });
      }
    } catch (error) {
      console.error('Error al crear materia:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la materia",
        variant: "destructive",
      });
    }
  };

  // Actualizar materia
  const updateSubject = async (id: string, updatedFields: Partial<Subject>) => {
    if (!user) return;

    try {
      // Validar código si se está actualizando
      if (updatedFields.code !== undefined) {
        if (!validateCode(updatedFields.code)) {
          toast({
            title: "Error en código",
            description: "El código de materia no tiene un formato válido.",
            variant: "destructive",
          });
          return;
        }

        // Verificar si el código ya existe (excluyendo la materia actual)
        if (codeExists(updatedFields.code, id)) {
          toast({
            title: "Código duplicado",
            description: "Ya existe otra materia con este código.",
            variant: "destructive",
          });
          return;
        }

        // Normalizar código
        updatedFields.code = updatedFields.code.toUpperCase().trim();
      }
      const updateData: any = {};
      if (updatedFields.name) updateData.name = updatedFields.name;
      if (updatedFields.code) updateData.code = updatedFields.code;
      if (updatedFields.color) updateData.color = updatedFields.color;
      if (updatedFields.professor_id !== undefined) updateData.professor_id = updatedFields.professor_id;
      if (updatedFields.description !== undefined) updateData.description = updatedFields.description;

      const { error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
      if (updatedFields.professorIds) {
        const currentSubject = subjects.find(s => s.id === id);

        if (currentSubject) {
          // Profesores a agregar (están en updatedFields.professorIds pero no en currentSubject.professorIds)
          const professorsToAdd = updatedFields.professorIds.filter(
            profId => !currentSubject.professorIds.includes(profId)
          );

          // Profesores a eliminar (están en currentSubject.professorIds pero no en updatedFields.professorIds)
          const professorsToRemove = currentSubject.professorIds.filter(
            profId => !updatedFields.professorIds.includes(profId)
          );

          // Agregar nuevos profesores
          for (const profId of professorsToAdd) {
            await assignProfessorToSubject(id, profId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Eliminar profesores
          for (const profId of professorsToRemove) {
            await removeProfessorFromSubject(id, profId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Actualizar el profesor principal si es necesario
          if (updatedFields.professorIds.length > 0 &&
            (!currentSubject.professor_id || professorsToRemove.includes(currentSubject.professor_id))) {

            await supabase
              .from('subjects')
              .update({ professor_id: updatedFields.professorIds[0] })
              .eq('id', id)
              .eq('user_id', user.id);

            updatedFields.professor_id = updatedFields.professorIds[0];
          } else if (updatedFields.professorIds.length === 0 && currentSubject.professor_id) {
            // Si se eliminaron todos los profesores, actualizar professor_id a null
            await supabase
              .from('subjects')
              .update({ professor_id: null })
              .eq('id', id)
              .eq('user_id', user.id);

            updatedFields.professor_id = null;
          }
        }
      }

      setSubjects(subjects.map(subject =>
        subject.id === id ? {
          ...subject,
          ...updatedFields,
          updatedAt: new Date().toISOString()
        } : subject
      ));

      toast({
        title: "Materia actualizada",
        description: "La materia ha sido actualizada exitosamente.",
      });
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la materia",
        variant: "destructive",
      });
    }
  };

  // Eliminar materia
  const deleteSubject = async (id: string) => {
    if (!user) return;

    try {
      const subjectToDelete = subjects.find(s => s.id === id);
      
      const { error: relationsError } = await supabase
        .from('professor_subjects')
        .delete()
        .eq('subject_id', id)
        .eq('user_id', user.id);

      if (relationsError) {
        throw relationsError;
      }

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setSubjects(subjects.filter(subject => subject.id !== id));

      toast({
        title: "Materia eliminada",
        description: `La materia "${subjectToDelete?.name}" ha sido eliminada.`,
      });
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la materia",
        variant: "destructive",
      });
    }
  };

  // Obtener materia por ID
  const getSubject = (id: string) => {
    return subjects.find(subject => subject.id === id);
  };

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        isLoading,
        addSubject,
        updateSubject,
        deleteSubject,
        getSubject,
        refreshSubjects,
        getSubjectByCode,
        validateCode,
        codeExists,
        assignProfessorToSubject,
        removeProfessorFromSubject,
        getProfessorsForSubject
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

// Hook
export function useSubjects() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects debe ser usado dentro de un SubjectProvider');
  }
  return context;
}
