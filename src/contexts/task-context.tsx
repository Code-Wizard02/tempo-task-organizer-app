import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";

// Tipos
export type TaskDifficulty = "easy" | "medium" | "hard";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority?: number;
  completed: boolean;
  dueDate: string;
  dueTime?: string;
  difficulty: TaskDifficulty;
  subjectId: string;
  professorId: string;
  createdAt: string;
  updatedAt: string;
};

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  getTasksByDifficulty: (difficulty: TaskDifficulty) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
  getTotalTasks: () => number;
  getCompletedTasksCount: () => number;
  getPendingTasksCount: () => number;
  getOverdueTasks: () => Task[];
};

// Crear contexto
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar tareas desde Supabase
  useEffect(() => {
    async function loadTasks() {
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const formattedTasks: Task[] = data.map((item) => {
          const task: Task = {
            id: item.id,
            title: item.title,
            description: item.description || "",
            completed: item.completed,
            dueDate: item.due_date.split("T")[0] || item.due_date,
            dueTime: item.due_date.includes("T")
              ? item.due_date.split("T")[1].substring(0, 5)
              : "23:59",
            difficulty: item.difficulty as TaskDifficulty,
            priority: item.priority,
            subjectId: item.subject_id || "",
            professorId: item.professor_id || "",
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          };
          task.priority = calculatePriority(task);
          return task;
        });

        formattedTasks.sort((a, b) => (a.priority || 3) - (b.priority || 3));

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadTasks();
  }, [user, toast]);

  // Añadir tarea
  const addTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!user) return;

    try {
      // Combinar fecha y hora para el formato ISO
      const dueDateTime = task.dueTime
        ? `${task.dueDate}T${task.dueTime}`
        : `${task.dueDate}T23:59:00`;

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: task.title,
            description: task.description,
            completed: task.completed,
            due_date: dueDateTime,
            difficulty: task.difficulty,
            priority: task.priority,
            subject_id: task.subjectId || null,
            professor_id: task.professorId || null,
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const newTask: Task = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description || "",
          completed: data[0].completed,
          dueDate: data[0].due_date.split("T")[0],
          dueTime: data[0].due_date.includes("T")
            ? data[0].due_date.split("T")[1].substring(0, 5)
            : "23:59",
          difficulty: data[0].difficulty as TaskDifficulty,
          priority: data[0].priority,
          subjectId: data[0].subject_id || "",
          professorId: data[0].professor_id || "",
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at,
        };

        setTasks([newTask, ...tasks]);

        toast({
          title: "Tarea creada",
          description: `La tarea "${task.title}" ha sido creada exitosamente.`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Actualizar tarea
  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (updatedFields.title !== undefined)
        updateData.title = updatedFields.title;
      if (updatedFields.description !== undefined)
        updateData.description = updatedFields.description;
      if (updatedFields.completed !== undefined)
        updateData.completed = updatedFields.completed;

      // Manejar actualización de fecha y hora
      if (updatedFields.dueDate !== undefined) {
        const currentTask = tasks.find((t) => t.id === id);
        const timeToUse =
          updatedFields.dueTime || currentTask?.dueTime || "23:59";
        updateData.due_date = `${updatedFields.dueDate}T${timeToUse}`;
      } else if (updatedFields.dueTime !== undefined) {
        const currentTask = tasks.find((t) => t.id === id);
        if (currentTask) {
          updateData.due_date = `${currentTask.dueDate}T${updatedFields.dueTime}`;
        }
      }

      if (updatedFields.difficulty !== undefined)
        updateData.difficulty = updatedFields.difficulty;
      if (updatedFields.priority !== undefined)
        updateData.priority = updatedFields.priority;
      if (updatedFields.subjectId !== undefined)
        updateData.subject_id = updatedFields.subjectId || null;
      if (updatedFields.professorId !== undefined)
        updateData.professor_id = updatedFields.professorId || null;

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTasks(
        tasks.map((task) => {
          if (task.id === id) {
            // Actualizar fecha y hora en el objeto local
            let dueDate = task.dueDate;
            let dueTime = task.dueTime;

            if (updatedFields.dueDate) dueDate = updatedFields.dueDate;
            if (updatedFields.dueTime) dueTime = updatedFields.dueTime;

            return {
              ...task,
              ...updatedFields,
              dueDate,
              dueTime,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        })
      );

      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Eliminar tarea
  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const taskToDelete = tasks.find((t) => t.id === id);

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTasks(tasks.filter((task) => task.id !== id));

      toast({
        title: "Tarea eliminada",
        description: `La tarea "${taskToDelete?.title}" ha sido eliminada.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Alternar estado de completado
  const toggleTaskStatus = async (id: string) => {
    if (!user) return;

    try {
      const taskToUpdate = tasks.find((t) => t.id === id);
      if (!taskToUpdate) return;

      const newStatus = !taskToUpdate.completed;

      const { error } = await supabase
        .from("tasks")
        .update({ completed: newStatus })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTasks(
        tasks.map((task) =>
          task.id === id
            ? {
              ...task,
              completed: newStatus,
              updatedAt: new Date().toISOString(),
            }
            : task
        )
      );

      toast({
        title: newStatus ? "Tarea completada" : "Tarea pendiente",
        description: `La tarea ha sido marcada como ${newStatus ? "completada" : "pendiente"
          }.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al cambiar estado de la tarea:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Obtener tareas por dificultad
  const getTasksByDifficulty = (difficulty: TaskDifficulty) => {
    return tasks.filter((task) => task.difficulty === difficulty);
  };

  // Obtener tareas completadas
  const getCompletedTasks = () => {
    return tasks.filter((task) => task.completed);
  };

  // Obtener tareas pendientes
  const getPendingTasks = () => {
    return tasks.filter((task) => !task.completed);
  };

  // Obtener tareas vencidas
  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter((task) => {
      if (task.completed) return false;
      const dueDate = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);
      return dueDate < now;
    });
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

  // Función para caclular la prioridad de una tarea
  const calculatePriority = (task: Task): number => {
    const now = new Date();
    const dueDate = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);
    const daysDifference =
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDifference < 3 && task.difficulty === "hard") {
      return 1; // Alta prioridad
    } else if (daysDifference < 7) {
      return 2; // Media prioridad
    } else {
      return 3; // Baja prioridad
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
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
        getOverdueTasks,
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
    throw new Error("useTasks debe ser usado dentro de un TaskProvider");
  }
  return context;
}
