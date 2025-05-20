
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';

// Tipos
export type Professor = {
  id: string;
  name: string;
  email: string;
  subjectIds: string[];
  createdAt: string;
  updatedAt: string;
};

type ProfessorContextType = {
  professors: Professor[];
  isLoading: boolean;
  addProfessor: (professor: Omit<Professor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfessor: (id: string, professor: Partial<Professor>) => Promise<void>;
  deleteProfessor: (id: string) => Promise<void>;
  getProfessor: (id: string) => Professor | undefined;
  getProfessorsBySubject: (subjectId: string) => Professor[];
  assignSubjectToProfessor: (professorId: string, subjectId: string) => Promise<void>;
  removeSubjectFromProfessor: (professorId: string, subjectId: string) => Promise<void>;
};

// Crear contexto
const ProfessorContext = createContext<ProfessorContextType | undefined>(undefined);

// Provider
export function ProfessorProvider({ children }: { children: React.ReactNode }) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Función para cargar la relación profesor-materia
  const loadProfessorSubjects = async (professorIds: string[]) => {
    if (!user || professorIds.length === 0) return {};

    const { data, error } = await supabase
      .from('professor_subjects')
      .select('professor_id, subject_id')
      .in('professor_id', professorIds);

    if (error) {
      console.error('Error al cargar relaciones profesor-materia:', error);
      return {};
    }

    // Agrupar las materias por profesor
    const subjectsByProfessor: Record<string, string[]> = {};
    data.forEach(relation => {
      if (!subjectsByProfessor[relation.professor_id]) {
        subjectsByProfessor[relation.professor_id] = [];
      }
      subjectsByProfessor[relation.professor_id].push(relation.subject_id);
    });

    return subjectsByProfessor;
  };

  // Cargar profesores desde Supabase
  useEffect(() => {
    async function loadProfessors() {
      if (!user) {
        setProfessors([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('professors')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Cargar las relaciones profesor-materia
        const professorIds = data.map(professor => professor.id);
        const subjectsByProfessor = await loadProfessorSubjects(professorIds);

        const formattedProfessors: Professor[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          subjectIds: subjectsByProfessor[item.id] || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setProfessors(formattedProfessors);
      } catch (error) {
        console.error('Error al cargar profesores:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los profesores",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfessors();
  }, [user, toast]);

  // Añadir profesor
  const addProfessor = async (professor: Omit<Professor, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('professors')
        .insert([
          {
            name: professor.name,
            email: professor.email,
            user_id: user.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const newProfessor: Professor = {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          subjectIds: [],
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        // Agregar asignaciones de materias si hay alguna
        if (professor.subjectIds && professor.subjectIds.length > 0) {
          for (const subjectId of professor.subjectIds) {
            await assignSubjectToProfessor(newProfessor.id, subjectId);
          }
          
          // Actualizar los subjectIds en el objeto del profesor
          newProfessor.subjectIds = [...professor.subjectIds];
        }
        
        setProfessors([newProfessor, ...professors]);
        
        toast({
          title: "Profesor creado",
          description: `El profesor "${professor.name}" ha sido añadido exitosamente.`,
        });
      }
    } catch (error) {
      console.error('Error al crear profesor:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el profesor",
        variant: "destructive",
      });
    }
  };

  // Actualizar profesor
  const updateProfessor = async (id: string, updatedFields: Partial<Professor>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      if (updatedFields.name) updateData.name = updatedFields.name;
      if (updatedFields.email) updateData.email = updatedFields.email;

      const { error } = await supabase
        .from('professors')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Actualizar las materias asignadas si han cambiado
      if (updatedFields.subjectIds) {
        const currentProfessor = professors.find(p => p.id === id);
        
        if (currentProfessor) {
          // Materias a agregar (están en updatedFields.subjectIds pero no en currentProfessor.subjectIds)
          const subjectsToAdd = updatedFields.subjectIds.filter(
            subjectId => !currentProfessor.subjectIds.includes(subjectId)
          );
          
          // Materias a eliminar (están en currentProfessor.subjectIds pero no en updatedFields.subjectIds)
          const subjectsToRemove = currentProfessor.subjectIds.filter(
            subjectId => !updatedFields.subjectIds.includes(subjectId)
          );
          
          // Agregar nuevas materias
          for (const subjectId of subjectsToAdd) {
            await assignSubjectToProfessor(id, subjectId);
          }
          
          // Eliminar materias
          for (const subjectId of subjectsToRemove) {
            await removeSubjectFromProfessor(id, subjectId);
          }
        }
      }

      setProfessors(professors.map(professor => 
        professor.id === id ? { 
          ...professor, 
          ...updatedFields,
          updatedAt: new Date().toISOString()
        } : professor
      ));
      
      toast({
        title: "Profesor actualizado",
        description: "La información del profesor ha sido actualizada exitosamente.",
      });
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el profesor",
        variant: "destructive",
      });
    }
  };

  // Eliminar profesor
  const deleteProfessor = async (id: string) => {
    if (!user) return;
    
    try {
      const professorToDelete = professors.find(p => p.id === id);
      
      const { error } = await supabase
        .from('professors')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setProfessors(professors.filter(professor => professor.id !== id));
      
      toast({
        title: "Profesor eliminado",
        description: `El profesor "${professorToDelete?.name}" ha sido eliminado.`,
      });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el profesor",
        variant: "destructive",
      });
    }
  };

  // Asignar materia a profesor
  const assignSubjectToProfessor = async (professorId: string, subjectId: string) => {
    if (!user || !subjectId) return;
    
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

      setProfessors(professors.map(professor => {
        if (professor.id === professorId) {
          return {
            ...professor,
            subjectIds: [...professor.subjectIds, subjectId]
          };
        }
        return professor;
      }));
    } catch (error) {
      console.error('Error al asignar materia a profesor:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar la materia al profesor",
        variant: "destructive",
      });
    }
  };

  // Eliminar materia de profesor
  const removeSubjectFromProfessor = async (professorId: string, subjectId: string) => {
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

      setProfessors(professors.map(professor => {
        if (professor.id === professorId) {
          return {
            ...professor,
            subjectIds: professor.subjectIds.filter(id => id !== subjectId)
          };
        }
        return professor;
      }));
    } catch (error) {
      console.error('Error al eliminar materia de profesor:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la materia del profesor",
        variant: "destructive",
      });
    }
  };

  // Obtener profesor por ID
  const getProfessor = (id: string) => {
    return professors.find(professor => professor.id === id);
  };

  // Obtener profesores por materia
  const getProfessorsBySubject = (subjectId: string) => {
    if (!subjectId) return [];
    return professors.filter(professor => professor.subjectIds.includes(subjectId));
  };

  return (
    <ProfessorContext.Provider 
      value={{ 
        professors, 
        isLoading,
        addProfessor, 
        updateProfessor, 
        deleteProfessor,
        getProfessor,
        getProfessorsBySubject,
        assignSubjectToProfessor,
        removeSubjectFromProfessor
      }}
    >
      {children}
    </ProfessorContext.Provider>
  );
}

// Hook
export function useProfessors() {
  const context = useContext(ProfessorContext);
  if (context === undefined) {
    throw new Error('useProfessors debe ser usado dentro de un ProfessorProvider');
  }
  return context;
}
