
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth-context';

// Tipos
export type Subject = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

type SubjectContextType = {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  getSubject: (id: string) => Subject | undefined;
};

// Mock de materias iniciales
const initialSubjects: Subject[] = [
  {
    id: '1',
    name: 'Matemáticas',
    color: '#4f46e5',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Física',
    color: '#0891b2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Historia',
    color: '#b45309',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Crear contexto
const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

// Provider
export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar materias al iniciar
  useEffect(() => {
    if (user) {
      const storedSubjects = localStorage.getItem(`subjects-${user.id}`);
      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects));
      } else {
        setSubjects(initialSubjects);
        localStorage.setItem(`subjects-${user.id}`, JSON.stringify(initialSubjects));
      }
    } else {
      setSubjects([]);
    }
  }, [user]);

  // Guardar materias cuando cambien
  useEffect(() => {
    if (user && subjects.length > 0) {
      localStorage.setItem(`subjects-${user.id}`, JSON.stringify(subjects));
    }
  }, [subjects, user]);

  // Añadir materia
  const addSubject = (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setSubjects([...subjects, newSubject]);
    toast({
      title: "Materia creada",
      description: `La materia "${subject.name}" ha sido creada exitosamente.`,
    });
  };

  // Actualizar materia
  const updateSubject = (id: string, updatedFields: Partial<Subject>) => {
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
  };

  // Eliminar materia
  const deleteSubject = (id: string) => {
    const subjectToDelete = subjects.find(s => s.id === id);
    setSubjects(subjects.filter(subject => subject.id !== id));
    
    toast({
      title: "Materia eliminada",
      description: `La materia "${subjectToDelete?.name}" ha sido eliminada.`,
    });
  };

  // Obtener materia por ID
  const getSubject = (id: string) => {
    return subjects.find(subject => subject.id === id);
  };

  return (
    <SubjectContext.Provider 
      value={{ 
        subjects, 
        addSubject, 
        updateSubject, 
        deleteSubject,
        getSubject, 
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
