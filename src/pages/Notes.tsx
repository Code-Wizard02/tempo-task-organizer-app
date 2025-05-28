import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ArrowLeft,
  SortAsc,
  SortDesc,
  BookOpen,
} from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { useSubjects } from "@/contexts/subject-context";
import { NoteEditor } from "@/components/notes/note-editor";
import { SubjectFolder } from "@/components/notes/subject-folder";
import { NoteCard } from "@/components/notes/note-card";

export default function Notes() {
  const { notes, deleteNote } = useNotes();
  const { subjects } = useSubjects();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Calcular carpetas de materias con notas
  const subjectFolders = useMemo(() => {
    const subjectsWithNotes = subjects
      .filter((subject) => notes.some((note) => note.subject_id === subject.id))
      .map((subject) => ({
        subject,
        noteCount: notes.filter((note) => note.subject_id === subject.id)
          .length,
      }));

    return subjectsWithNotes;
  }, [subjects, notes]);

  // Filtrar y ordenar notas cuando se selecciona una materia
  const filteredNotes = useMemo(() => {
    if (!selectedSubjectId) return [];

    let filtered = notes.filter(
      (note) => note.subject_id === selectedSubjectId
    );

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

    return filtered;
  }, [notes, selectedSubjectId, searchTerm, sortBy, sortDirection]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      await deleteNote(noteId);
    }
  };

  const handleBackToFolders = () => {
    setSelectedSubjectId(null);
    setSearchTerm("");
  };

  const toggleSort = (field: "date" | "title") => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  // Vista principal - mostrar carpetas de materias
  if (!selectedSubjectId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestión de Notas</h2>
            <p className="text-muted-foreground">
              Organiza tus notas por materias
            </p>
          </div>
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Nota
          </Button>
        </div>

        {subjectFolders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes notas aún
              </h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera nota para empezar a organizar tu conocimiento
              </p>
              <Button onClick={handleCreateNote}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primera nota
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjectFolders.map(({ subject, noteCount }) => (
              <SubjectFolder
                key={subject.id}
                subject={subject}
                noteCount={noteCount}
                onClick={() => setSelectedSubjectId(subject.id)}
              />
            ))}
          </div>
        )}

        <NoteEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          note={editingNote}
        />
      </div>
    );
  }

  // Vista de notas de una materia específica
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 relative">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToFolders}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {selectedSubject && (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedSubject.color }}
                />
              )}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {selectedSubject?.name}
                </h2>
                <p className="text-muted-foreground">
                  {filteredNotes.length}{" "}
                  {filteredNotes.length === 1 ? "nota" : "notas"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón "Nueva Nota" para dispositivos móviles */}
        <div className="block sm:hidden">
          <Button onClick={handleCreateNote} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Nota
          </Button>
        </div>

        {/* Botón "Nueva Nota" para pantallas más grandes */}
        <div className="hidden sm:block absolute top-0 right-0 mt-4 mr-4">
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Nota
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros y búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("date")}
                className="flex items-center gap-2"
              >
                Fecha
                {sortBy === "date" &&
                  (sortDirection === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  ))}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("title")}
                className="flex items-center gap-2"
              >
                Título
                {sortBy === "title" &&
                  (sortDirection === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  ))}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notas */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "No se encontraron notas"
                : "No hay notas en esta materia"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primera nota para esta materia"}
            </p>
            <Button onClick={handleCreateNote}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Nota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              subjectColor={selectedSubject?.color || "#6366f1"}
              onEdit={() => handleEditNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
              onClick={() => handleEditNote(note)}
            />
          ))}
        </div>
      )}

      <NoteEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        note={editingNote}
        preselectedSubjectId={selectedSubjectId}
      />
    </div>
  );
}
