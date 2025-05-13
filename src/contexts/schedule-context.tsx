
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';

// Tipos
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ScheduleEntry = {
  id: string;
  subjectId: string;
  professorId: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  updatedAt: string;
};

type ScheduleContextType = {
  scheduleEntries: ScheduleEntry[];
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateScheduleEntry: (id: string, entry: Partial<ScheduleEntry>) => void;
  deleteScheduleEntry: (id: string) => void;
  getEntriesByDay: (day: WeekDay) => ScheduleEntry[];
  getEntriesBySubject: (subjectId: string) => ScheduleEntry[];
};

// Mock de entradas de horario iniciales
const initialScheduleEntries: ScheduleEntry[] = [
  {
    id: '1',
    subjectId: '1',
    professorId: '1',
    day: 'monday',
    startTime: '08:00',
    endTime: '10:00',
    location: 'Aula 101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    subjectId: '2',
    professorId: '2',
    day: 'wednesday',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Laboratorio 3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    subjectId: '3',
    professorId: '3',
    day: 'friday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Aula 205',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Crear contexto
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Provider
export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar horario al iniciar
  useEffect(() => {
    if (user) {
      const storedSchedule = localStorage.getItem(`schedule-${user.id}`);
      if (storedSchedule) {
        setScheduleEntries(JSON.parse(storedSchedule));
      } else {
        setScheduleEntries(initialScheduleEntries);
        localStorage.setItem(`schedule-${user.id}`, JSON.stringify(initialScheduleEntries));
      }
    } else {
      setScheduleEntries([]);
    }
  }, [user]);

  // Guardar horario cuando cambie
  useEffect(() => {
    if (user && scheduleEntries.length > 0) {
      localStorage.setItem(`schedule-${user.id}`, JSON.stringify(scheduleEntries));
    }
  }, [scheduleEntries, user]);

  // Añadir entrada al horario
  const addScheduleEntry = (entry: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: ScheduleEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setScheduleEntries([...scheduleEntries, newEntry]);
    toast({
      title: "Horario actualizado",
      description: "Se ha añadido una nueva clase al horario.",
    });
  };

  // Actualizar entrada del horario
  const updateScheduleEntry = (id: string, updatedFields: Partial<ScheduleEntry>) => {
    setScheduleEntries(entries => entries.map(entry => 
      entry.id === id ? { 
        ...entry, 
        ...updatedFields, 
        updatedAt: new Date().toISOString() 
      } : entry
    ));
    
    toast({
      title: "Horario actualizado",
      description: "La clase ha sido actualizada correctamente.",
    });
  };

  // Eliminar entrada del horario
  const deleteScheduleEntry = (id: string) => {
    setScheduleEntries(entries => entries.filter(entry => entry.id !== id));
    
    toast({
      title: "Horario actualizado",
      description: "La clase ha sido eliminada del horario.",
    });
  };

  // Obtener entradas por día
  const getEntriesByDay = (day: WeekDay) => {
    return scheduleEntries.filter(entry => entry.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Obtener entradas por materia
  const getEntriesBySubject = (subjectId: string) => {
    return scheduleEntries.filter(entry => entry.subjectId === subjectId);
  };

  return (
    <ScheduleContext.Provider 
      value={{ 
        scheduleEntries, 
        addScheduleEntry, 
        updateScheduleEntry, 
        deleteScheduleEntry,
        getEntriesByDay,
        getEntriesBySubject
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
