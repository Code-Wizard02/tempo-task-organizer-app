
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { is } from 'date-fns/locale';

// Tipos
export type ScheduleEntry = {
  id: string;
  subjectId: string;
  professorId: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  updatedAt: string;
};

export const dayNames = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

type ScheduleContextType = {
  scheduleEntries: ScheduleEntry[];
  isLoading: boolean;
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateScheduleEntry: (id: string, entry: Partial<ScheduleEntry>) => Promise<void>;
  deleteScheduleEntry: (id: string) => Promise<void>;
  getScheduleEntriesByDay: (day: number) => ScheduleEntry[];
  getScheduleEntryById: (id: string) => ScheduleEntry | undefined;
};

// Crear contexto
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Provider
export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  //Cargar horario desde Supabase
  useEffect(() => {
    console.log('verificando usuario', user);
    if (!user || !user.id) {
        setScheduleEntries([]);
        setIsLoading(false);
      return;
    }
    async function loadSchedule() {
      if (isLoading) return;
      try {
        console.log('Antes de setIsLoading(true)', isLoading);
        setIsLoading(true);
        console.log('Despues de setIsLoading(true)', isLoading);

        const { data, error } = await supabase
          .from('schedule')
          .select('*')
          .eq('user_id', user.id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true });
        setIsLoading(false);
        if (error) {
          throw error;
        }

        const formattedEntries: ScheduleEntry[] = data.map((item) => ({
          id: item.id,
          subjectId: item.subject_id || '',
          professorId: item.professor_id || '',
          dayOfWeek: item.day_of_week,
          startTime: item.start_time,
          endTime: item.end_time,
          location: item.location || '',
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setScheduleEntries(formattedEntries);
      } catch (error) {
        console.error('Error al cargar horario:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el horario",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        console.log('Carga finalizada: isLoading FALSE', isLoading);
        setIsLoading(false);
      }
    }

    loadSchedule();
  }, [user]);

  useEffect(() => {
    console.log('Estado de isLoading:', isLoading);
  }, [isLoading]);

  // Añadir entrada de horario
  const addScheduleEntry = async (entry: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('schedule')
        .insert([
          {
            subject_id: entry.subjectId,
            professor_id: entry.professorId,
            day_of_week: entry.dayOfWeek,
            start_time: entry.startTime,
            end_time: entry.endTime,
            location: entry.location,
            user_id: user.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const newEntry: ScheduleEntry = {
          id: data[0].id,
          subjectId: data[0].subject_id || '',
          professorId: data[0].professor_id || '',
          dayOfWeek: data[0].day_of_week,
          startTime: data[0].start_time,
          endTime: data[0].end_time,
          location: data[0].location || '',
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        setScheduleEntries([...scheduleEntries, newEntry]);
        
        toast({
          title: "Horario actualizado",
          description: `Se ha añadido una nueva clase de ${dayNames[entry.dayOfWeek]} a las ${entry.startTime}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error al crear entrada de horario:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la entrada al horario",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Actualizar entrada de horario
  const updateScheduleEntry = async (id: string, updatedFields: Partial<ScheduleEntry>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      if (updatedFields.subjectId !== undefined) updateData.subject_id = updatedFields.subjectId;
      if (updatedFields.professorId !== undefined) updateData.professor_id = updatedFields.professorId;
      if (updatedFields.dayOfWeek !== undefined) updateData.day_of_week = updatedFields.dayOfWeek;
      if (updatedFields.startTime !== undefined) updateData.start_time = updatedFields.startTime;
      if (updatedFields.endTime !== undefined) updateData.end_time = updatedFields.endTime;
      if (updatedFields.location !== undefined) updateData.location = updatedFields.location;

      const { error } = await supabase
        .from('schedule')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setScheduleEntries(scheduleEntries.map(entry => 
        entry.id === id ? { 
          ...entry, 
          ...updatedFields,
          updatedAt: new Date().toISOString()
        } : entry
      ));
      
      toast({
        title: "Horario actualizado",
        description: "La entrada del horario ha sido actualizada exitosamente.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al actualizar entrada de horario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la entrada del horario",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Eliminar entrada de horario
  const deleteScheduleEntry = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setScheduleEntries(scheduleEntries.filter(entry => entry.id !== id));
      
      toast({
        title: "Entrada eliminada",
        description: "La entrada del horario ha sido eliminada.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al eliminar entrada de horario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la entrada del horario",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Obtener entradas por día
  const getScheduleEntriesByDay = (day: number) => {
    return scheduleEntries.filter(entry => entry.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Obtener entrada por ID
  const getScheduleEntryById = (id: string) => {
    return scheduleEntries.find(entry => entry.id === id);
  };

  return (
    <ScheduleContext.Provider 
      value={{ 
        scheduleEntries, 
        isLoading,
        addScheduleEntry, 
        updateScheduleEntry, 
        deleteScheduleEntry,
        getScheduleEntriesByDay,
        getScheduleEntryById
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

// Hook
export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule debe ser usado dentro de un ScheduleProvider');
  }
  return context;
}
