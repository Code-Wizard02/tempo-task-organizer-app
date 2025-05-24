
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';

export type Note = {
  id: string;
  title: string;
  content: string | null;
  subject_id: string;
  createdAt: string;
  updatedAt: string;
};

type NotesContextType = {
  notes: Note[];
  isLoading: boolean;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  getNotesBySubject: (subjectId: string) => Note[];
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar notas desde Supabase
  useEffect(() => {
    async function loadNotes() {
      if (!user) {
        setNotes([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedNotes: Note[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          subject_id: item.subject_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setNotes(formattedNotes);
      } catch (error) {
        console.error('Error al cargar notas:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las notas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, [user, toast]);

  // Añadir nota
  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title: note.title,
            content: note.content,
            subject_id: note.subject_id,
            user_id: user.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const newNote: Note = {
          id: data[0].id,
          title: data[0].title,
          content: data[0].content,
          subject_id: data[0].subject_id,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        setNotes([newNote, ...notes]);
        
        toast({
          title: "Nota creada",
          description: `La nota "${note.title}" ha sido creada exitosamente.`,
        });
      }
    } catch (error) {
      console.error('Error al crear nota:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la nota",
        variant: "destructive",
      });
    }
  };

  // Actualizar nota
  const updateNote = async (id: string, updatedFields: Partial<Note>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      if (updatedFields.title) updateData.title = updatedFields.title;
      if (updatedFields.content !== undefined) updateData.content = updatedFields.content;
      if (updatedFields.subject_id) updateData.subject_id = updatedFields.subject_id;

      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setNotes(notes.map(note => 
        note.id === id ? { 
          ...note, 
          ...updatedFields, 
          updatedAt: new Date().toISOString() 
        } : note
      ));
      
      toast({
        title: "Nota actualizada",
        description: "La nota ha sido actualizada exitosamente.",
      });
    } catch (error) {
      console.error('Error al actualizar nota:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la nota",
        variant: "destructive",
      });
    }
  };

  // Eliminar nota
  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      const noteToDelete = notes.find(n => n.id === id);
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setNotes(notes.filter(note => note.id !== id));
      
      toast({
        title: "Nota eliminada",
        description: `La nota "${noteToDelete?.title}" ha sido eliminada.`,
      });
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive",
      });
    }
  };

  // Obtener nota por ID
  const getNote = (id: string) => {
    return notes.find(note => note.id === id);
  };

  // Obtener notas por materia
  const getNotesBySubject = (subjectId: string) => {
    return notes.filter(note => note.subject_id === subjectId);
  };

  return (
    <NotesContext.Provider 
      value={{ 
        notes, 
        isLoading,
        addNote, 
        updateNote, 
        deleteNote,
        getNote,
        getNotesBySubject
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes debe ser usado dentro de un NotesProvider');
  }
  return context;
}
