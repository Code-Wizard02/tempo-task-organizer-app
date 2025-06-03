
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotes, Note } from "@/contexts/notes-context";
import { useSubjects } from "@/contexts/subject-context";
import { ArrowLeft, Save } from "lucide-react";

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
  preselectedSubjectId?: string;
}

export function NoteEditor({ note, isOpen, onClose, preselectedSubjectId }: NoteEditorProps) {
  const { addNote, updateNote } = useNotes();
  const { subjects } = useSubjects();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setSubjectId(note.subject_id);
    } else {
      setTitle('');
      setContent('');
      setSubjectId(preselectedSubjectId || '');
    }
  }, [note, preselectedSubjectId, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !subjectId) return;

    setIsSaving(true);
    try {
      if (note) {
        await updateNote(note.id, {
          title: title.trim(),
          content: content.trim(),
          subject_id: subjectId
        });
      } else {
        await addNote({
          title: title.trim(),
          content: content.trim(),
          subject_id: subjectId
        });
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === subjectId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-lg">
              {note ? 'Editar Nota' : 'Nueva Nota'}
            </DialogTitle>
            {selectedSubject && (
              <div 
                className="w-4 h-4 rounded-full ml-auto"
                style={{ backgroundColor: selectedSubject.color }}
                title={selectedSubject.name}
              />
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota..."
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Materia</label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-sm font-medium mb-2 block">Contenido</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              className="flex-1 resize-none min-h-[200px] md:min-h-[250px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || !subjectId || isSaving}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
