
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';

// Tipos
export type Subject = {
  id: string;
  name: string;
  color: string;
  professor_id: string | null;
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
};

// Crear contexto
const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

// Provider
export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

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

      const formattedSubjects: Subject[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        professor_id: item.professor_id,
        description: item.description,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error('Error refreshing subjects:', error);
    }
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

        const formattedSubjects: Subject[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          color: item.color,
          professor_id: item.professor_id,
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
      const { data, error } = await supabase
        .from('subjects')
        .insert([
          {
            name: subject.name,
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
          color: data[0].color,
          professor_id: data[0].professor_id,
          description: data[0].description,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };

        setSubjects([newSubject, ...subjects]);

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
      const updateData: any = {};
      if (updatedFields.name) updateData.name = updatedFields.name;
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
