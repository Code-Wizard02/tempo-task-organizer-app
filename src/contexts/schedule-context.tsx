
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';

// Types
export type ScheduleEntry = {
  id: string;
  subject_id: string;
  start_time: string; // Format: "HH:MM"
  end_time: string; // Format: "HH:MM"
  days_of_week: string[]; // e.g. ["monday", "wednesday", "friday"]
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type ScheduleContextType = {
  scheduleEntries: ScheduleEntry[];
  isLoading: boolean;
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateScheduleEntry: (id: string, entry: Partial<ScheduleEntry>) => Promise<void>;
  deleteScheduleEntry: (id: string) => Promise<void>;
  getScheduleEntry: (id: string) => ScheduleEntry | undefined;
  getEntriesBySubjectId: (subjectId: string) => ScheduleEntry[];
  refreshEntries: () => Promise<void>;
};

// Create context
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Provider
export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load schedule entries from Supabase
  const loadScheduleEntries = async () => {
    if (!user) {
      setScheduleEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schedule_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedEntries: ScheduleEntry[] = data.map((item) => ({
        id: item.id,
        subject_id: item.subject_id,
        start_time: item.start_time,
        end_time: item.end_time,
        days_of_week: item.days_of_week,
        location: item.location,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setScheduleEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading schedule entries:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadScheduleEntries();
  }, [user, toast]);

  // Refresh entries
  const refreshEntries = async () => {
    await loadScheduleEntries();
  };

  // Add schedule entry
  const addScheduleEntry = async (entry: Omit<ScheduleEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('schedule_entries')
        .insert([
          {
            ...entry,
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
          subject_id: data[0].subject_id,
          start_time: data[0].start_time,
          end_time: data[0].end_time,
          days_of_week: data[0].days_of_week,
          location: data[0].location,
          notes: data[0].notes,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        
        setScheduleEntries([newEntry, ...scheduleEntries]);
        
        toast({
          title: "Horario creado",
          description: "El horario ha sido creado exitosamente.",
        });
      }
    } catch (error) {
      console.error('Error al crear horario:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el horario",
        variant: "destructive",
      });
    }
  };

  // Update schedule entry
  const updateScheduleEntry = async (id: string, updatedFields: Partial<ScheduleEntry>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('schedule_entries')
        .update(updatedFields)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setScheduleEntries(scheduleEntries.map(entry => 
        entry.id === id ? { 
          ...entry, 
          ...updatedFields, 
          updated_at: new Date().toISOString() 
        } : entry
      ));
      
      toast({
        title: "Horario actualizado",
        description: "El horario ha sido actualizado exitosamente.",
      });
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el horario",
        variant: "destructive",
      });
    }
  };

  // Delete schedule entry
  const deleteScheduleEntry = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('schedule_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setScheduleEntries(scheduleEntries.filter(entry => entry.id !== id));
      
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario",
        variant: "destructive",
      });
    }
  };

  // Get schedule entry by ID
  const getScheduleEntry = (id: string) => {
    return scheduleEntries.find(entry => entry.id === id);
  };

  // Get entries by subject ID
  const getEntriesBySubjectId = (subjectId: string) => {
    return scheduleEntries.filter(entry => entry.subject_id === subjectId);
  };

  return (
    <ScheduleContext.Provider 
      value={{ 
        scheduleEntries, 
        isLoading,
        addScheduleEntry, 
        updateScheduleEntry, 
        deleteScheduleEntry,
        getScheduleEntry,
        getEntriesBySubjectId,
        refreshEntries
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
