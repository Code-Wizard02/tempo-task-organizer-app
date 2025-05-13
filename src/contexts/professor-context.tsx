
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth-context';

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
  addProfessor: (professor: Omit<Professor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfessor: (id: string, professor: Partial<Professor>) => void;
  deleteProfessor: (id: string) => void;
  getProfessor: (id: string) => Professor | undefined;
  getProfessorsBySubject: (subjectId: string) => Professor[];
};

// Mock de profesores iniciales
const initialProfessors: Professor[] = [
  {
    id: '1',
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@universidad.edu',
    subjectIds: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dra. María Rodríguez',
    email: 'maria.rodriguez@universidad.edu',
    subjectIds: ['2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Dr. Roberto González',
    email: 'roberto.gonzalez@universidad.edu',
    subjectIds: ['3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Crear contexto
const ProfessorContext = createContext<ProfessorContextType | undefined>(undefined);

// Provider
export function ProfessorProvider({ children }: { children: React.ReactNode }) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar profesores al iniciar
  useEffect(() => {
    if (user) {
      const storedProfessors = localStorage.getItem(`professors-${user.id}`);
      if (storedProfessors) {
        setProfessors(JSON.parse(storedProfessors));
      } else {
        setProfessors(initialProfessors);
        localStorage.setItem(`professors-${user.id}`, JSON.stringify(initialProfessors));
      }
    } else {
      setProfessors([]);
    }
  }, [user]);

  // Guardar profesores cuando cambien
  useEffect(() => {
    if (user && professors.length > 0) {
      localStorage.setItem(`professors-${user.id}`, JSON.stringify(professors));
    }
  }, [professors, user]);

  // Añadir profesor
  const addProfessor = (professor: Omit<Professor, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProfessor: Professor = {
      ...professor,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setProfessors([...professors, newProfessor]);
    toast({
      title: "Profesor creado",
      description: `El profesor "${professor.name}" ha sido añadido exitosamente.`,
    });
  };

  // Actualizar profesor
  const updateProfessor = (id: string, updatedFields: Partial<Professor>) => {
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
  };

  // Eliminar profesor
  const deleteProfessor = (id: string) => {
    const professorToDelete = professors.find(p => p.id === id);
    setProfessors(professors.filter(professor => professor.id !== id));
    
    toast({
      title: "Profesor eliminado",
      description: `El profesor "${professorToDelete?.name}" ha sido eliminado.`,
    });
  };

  // Obtener profesor por ID
  const getProfessor = (id: string) => {
    return professors.find(professor => professor.id === id);
  };

  // Obtener profesores por materia
  const getProfessorsBySubject = (subjectId: string) => {
    return professors.filter(professor => professor.subjectIds.includes(subjectId));
  };

  return (
    <ProfessorContext.Provider 
      value={{ 
        professors, 
        addProfessor, 
        updateProfessor, 
        deleteProfessor,
        getProfessor,
        getProfessorsBySubject 
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
