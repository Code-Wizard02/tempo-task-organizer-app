
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth-context';

// Tipos
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  difficulty: TaskDifficulty;
  subjectId: string;
  professorId: string;
  createdAt: string;
  updatedAt: string;
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  getTasksByDifficulty: (difficulty: TaskDifficulty) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
  getTotalTasks: () => number;
  getCompletedTasksCount: () => number;
  getPendingTasksCount: () => number;
};

// Mock de tareas iniciales
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Completar tarea de matemáticas',
    description: 'Ejercicios del 1 al 10 del capítulo 3',
    completed: false,
    dueDate: '2023-05-20',
    difficulty: 'medium',
    subjectId: '1',
    professorId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Estudiar para examen de física',
    description: 'Repasar leyes de Newton y movimiento circular',
    completed: true,
    dueDate: '2023-05-18',
    difficulty: 'hard',
    subjectId: '2',
    professorId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Preparar presentación de historia',
    description: 'Sobre la revolución industrial',
    completed: false,
    dueDate: '2023-05-25',
    difficulty: 'easy',
    subjectId: '3',
    professorId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Crear contexto
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar tareas al iniciar
  useEffect(() => {
    if (user) {
      // En una app real, aquí cargaríamos las tareas del usuario desde un backend
      // Por ahora usamos datos mock
      const storedTasks = localStorage.getItem(`tasks-${user.id}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(initialTasks);
        localStorage.setItem(`tasks-${user.id}`, JSON.stringify(initialTasks));
      }
    } else {
      setTasks([]);
    }
  }, [user]);

  // Guardar tareas cuando cambien
  useEffect(() => {
    if (user && tasks.length > 0) {
      localStorage.setItem(`tasks-${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Añadir tarea
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks([...tasks, newTask]);
    toast({
      title: "Tarea creada",
      description: `La tarea "${task.title}" ha sido creada exitosamente.`,
    });
  };

  // Actualizar tarea
  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        ...updatedFields, 
        updatedAt: new Date().toISOString() 
      } : task
    ));
    
    toast({
      title: "Tarea actualizada",
      description: "La tarea ha sido actualizada exitosamente.",
    });
  };

  // Eliminar tarea
  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    
    toast({
      title: "Tarea eliminada",
      description: `La tarea "${taskToDelete?.title}" ha sido eliminada.`,
    });
  };

  // Alternar estado de completado
  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        updatedAt: new Date().toISOString() 
      } : task
    ));
  };

  // Obtener tareas por dificultad
  const getTasksByDifficulty = (difficulty: TaskDifficulty) => {
    return tasks.filter(task => task.difficulty === difficulty);
  };

  // Obtener tareas completadas
  const getCompletedTasks = () => {
    return tasks.filter(task => task.completed);
  };

  // Obtener tareas pendientes
  const getPendingTasks = () => {
    return tasks.filter(task => !task.completed);
  };

  // Obtener total de tareas
  const getTotalTasks = () => {
    return tasks.length;
  };

  // Obtener número de tareas completadas
  const getCompletedTasksCount = () => {
    return getCompletedTasks().length;
  };

  // Obtener número de tareas pendientes
  const getPendingTasksCount = () => {
    return getPendingTasks().length;
  };

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        addTask, 
        updateTask, 
        deleteTask, 
        toggleTaskStatus, 
        getTasksByDifficulty,
        getCompletedTasks,
        getPendingTasks,
        getTotalTasks,
        getCompletedTasksCount,
        getPendingTasksCount,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// Hook
export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks debe ser usado dentro de un TaskProvider');
  }
  return context;
}
