
import React, { useState } from "react";
import { 
  Calendar, Clock, MapPin, Plus, Edit, Trash, Loader2, 
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchedule, dayNames } from "@/contexts/schedule-context";
import { useSubjects } from "@/contexts/subject-context";
import { useProfessors } from "@/contexts/professor-context";
import { useMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { set } from "date-fns";

export default function Schedule() {
  const { user } = useAuth();
  const { 
    scheduleEntries, 
    isLoading,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    getScheduleEntriesByDay 
  } = useSchedule();
  const { subjects } = useSubjects();
  const { professors, getProfessorsBySubject } = useProfessors();
  const { isMobile } = useMobile();

  const [currentDay, setCurrentDay] = useState(1); // Comenzar en lunes (1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  
  const [newEntry, setNewEntry] = useState({
    subjectId: "",
    professorId: "",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
    location: ""
  });

  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [entryToEdit, setEntryToEdit] = useState({
    id: "",
    subjectId: "",
    professorId: "",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
    location: ""
  });

    const timeSlots = [
      "07:00", "08:00", "09:00", 
      "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00",
      "16:00", "17:00", "18:00",
      "19:00", "20:00", "21:00"
    ];

  const handlePreviousDay = () => {
    setCurrentDay(prev => prev === 0 ? 6 : prev - 1);
  };

  const handleNextDay = () => {
    setCurrentDay(prev => prev === 6 ? 0 : prev + 1);
  };

  const openAddDialog = (day = currentDay) => {
    setNewEntry({
      ...newEntry,
      dayOfWeek: day
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const entry = scheduleEntries.find(e => e.id === id);
    if (entry) {
      setEditingEntry(id);
      setEntryToEdit({
        id: entry.id,
        subjectId: entry.subjectId,
        professorId: entry.professorId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        location: entry.location
      });
      setIsEditDialogOpen(true);
    }
  };

  const openDeleteDialog = (id: string) => {
    const entry = scheduleEntries.find(e => e.id === id);
    if (entry) {
      setEditingEntry(id);
      setEntryToEdit({
        id: entry.id,
        subjectId: entry.subjectId,
        professorId: entry.professorId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        location: entry.location
      });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleAddEntry = async () => {
    setIsSubmitting(true);
    try {
      await addScheduleEntry({
        subjectId: newEntry.subjectId,
        professorId: newEntry.professorId,
        dayOfWeek: newEntry.dayOfWeek,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        location: newEntry.location
      });
      setIsAddDialogOpen(false);
      resetEntryForm();
    } catch (error) {
      console.error("Error al añadir entrada:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;
    
    setIsSubmitting(true);
    try {
      await updateScheduleEntry(editingEntry, {
        subjectId: entryToEdit.subjectId,
        professorId: entryToEdit.professorId,
        dayOfWeek: entryToEdit.dayOfWeek,
        startTime: entryToEdit.startTime,
        endTime: entryToEdit.endTime,
        location: entryToEdit.location
      });
      setIsEditDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error al actualizar entrada:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!editingEntry) return;
    
    setIsSubmitting(true);
    try {
      await deleteScheduleEntry(editingEntry);
      setIsDeleteDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error al eliminar entrada:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEntryForm = () => {
    setNewEntry({
      subjectId: "",
      professorId: "",
      dayOfWeek: currentDay,
      startTime: "08:00",
      endTime: "09:00",
      location: ""
    });
  };

  // Función para manejar el cambio de materia y actualizar profesores disponibles
  const handleSubjectChange = (subjectId: string, isNew = true) => {
    // Obtener profesores asociados a esta materia
    const subjectProfessors = getProfessorsBySubject(subjectId);
    
    if (isNew) {
      // Para nueva entrada
      if (subjectProfessors.length === 1) {
        // Si hay un solo profesor, asignarlo automáticamente
        setNewEntry({
          ...newEntry,
          subjectId,
          professorId: subjectProfessors[0].id
        });
      } else {
        // Si hay múltiples o ninguno, solo actualizar subjectId
        setNewEntry({
          ...newEntry,
          subjectId,
          professorId: "" // Limpiar la selección de profesor
        });
      }
    } else {
      // Para edición
      if (subjectProfessors.length === 1) {
        setEntryToEdit({
          ...entryToEdit,
          subjectId,
          professorId: subjectProfessors[0].id
        });
      } else {
        setEntryToEdit({
          ...entryToEdit,
          subjectId,
          professorId: "" // Limpiar la selección de profesor
        });
      }
    }
  };

  // Filtrar profesores basados en la materia seleccionada
  const getFilteredProfessors = (subjectId: string) => {
    if (!subjectId) return professors;
    return getProfessorsBySubject(subjectId);
  };

  // Función para validar el formulario
  const isFormValid = (isNew = true) => {
    const entry = isNew ? newEntry : entryToEdit;
    return (
      entry.subjectId && 
      entry.dayOfWeek !== undefined && 
      entry.startTime && 
      entry.endTime &&
      new Date(`2000-01-01T${entry.endTime}`) > new Date(`2000-01-01T${entry.startTime}`)
    );
  };

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="mb-4">Debes iniciar sesión para ver esta página.</p>
        <Button onClick={() => window.location.href = "/login"}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Cargando horario...</p>
      </div>
    );
  }

  // Renderizar la vista de horario
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Horario de Clases</h2>
          <p className="text-muted-foreground">
            Organiza tus clases semanales
          </p>
        </div>
        <Button onClick={() => openAddDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Clase
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Horario</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium w-24 text-center">{dayNames[currentDay]}</span>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Visualiza y administra tu horario de clases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getScheduleEntriesByDay(currentDay).length === 0 ? (
            <div className="py-12 text-center border rounded-lg">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No hay clases programadas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No tienes clases programadas para este día
              </p>
              <Button variant="outline" onClick={() => openAddDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Clase
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {getScheduleEntriesByDay(currentDay).map((entry) => {
                const subject = subjects.find(s => s.id === entry.subjectId);
                const professor = professors.find(p => p.id === entry.professorId);
                
                return (
                  <div 
                    key={entry.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    style={{ borderLeft: `4px solid ${subject?.color || '#ccc'}` }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">{subject?.name || 'Materia no especificada'}</h3>
                        <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{entry.startTime} - {entry.endTime}</span>
                          </div>
                          {professor && (
                            <div className="flex items-center">
                              <span>Prof. {professor.name}</span>
                            </div>
                          )}
                          {entry.location && (
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>{entry.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openEditDialog(entry.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openDeleteDialog(entry.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para añadir clase */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[95%] max-w-[95%]")}>
          <DialogHeader>
            <DialogTitle>Añadir Clase</DialogTitle>
            <DialogDescription>
              Completa los detalles para programar una nueva clase
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Materia</Label>
              <Select 
                value={newEntry.subjectId} 
                onValueChange={(value) => handleSubjectChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="professor">Profesor</Label>
              <Select 
                value={newEntry.professorId} 
                onValueChange={(value) => setNewEntry({...newEntry, professorId: value})}
                disabled={!newEntry.subjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !newEntry.subjectId 
                      ? "Primero selecciona una materia" 
                      : "Selecciona un profesor"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredProfessors(newEntry.subjectId).length > 0 ? (
                    getFilteredProfessors(newEntry.subjectId).map((professor) => (
                      <SelectItem key={professor.id} value={professor.id}>
                        {professor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No hay profesores asignados a esta materia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Día de la semana</Label>
              <Select 
                value={newEntry.dayOfWeek.toString()} 
                onValueChange={(value) => setNewEntry({...newEntry, dayOfWeek: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                {isMobile ? (
                  <Select 
                    value={newEntry.startTime} 
                    onValueChange={(value) => setNewEntry({...newEntry, startTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="startTime"
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                  />
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                {isMobile ? (
                  <Select 
                    value={newEntry.endTime} 
                    onValueChange={(value) => setNewEntry({...newEntry, endTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="endTime"
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                  />
                )}
                {new Date(`2000-01-01T${newEntry.endTime}`) <= new Date(`2000-01-01T${newEntry.startTime}`) && (
                  <p className="text-xs text-destructive">La hora de fin debe ser posterior a la hora de inicio</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Ubicación (opcional)</Label>
              <Input
                id="location"
                placeholder="Aula, edificio, etc."
                value={newEntry.location}
                onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetEntryForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddEntry} 
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar clase */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[95%] max-w-[95%]")}>
          <DialogHeader>
            <DialogTitle>Editar Clase</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la clase programada
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subject-edit">Materia</Label>
              <Select 
                value={entryToEdit.subjectId} 
                onValueChange={(value) => handleSubjectChange(value, false)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="professor-edit">Profesor</Label>
              <Select 
                value={entryToEdit.professorId} 
                onValueChange={(value) => setEntryToEdit({...entryToEdit, professorId: value})}
                disabled={!entryToEdit.subjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !entryToEdit.subjectId 
                      ? "Primero selecciona una materia" 
                      : "Selecciona un profesor"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredProfessors(entryToEdit.subjectId).length > 0 ? (
                    getFilteredProfessors(entryToEdit.subjectId).map((professor) => (
                      <SelectItem key={professor.id} value={professor.id}>
                        {professor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No hay profesores asignados a esta materia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek-edit">Día de la semana</Label>
              <Select 
                value={entryToEdit.dayOfWeek.toString()} 
                onValueChange={(value) => setEntryToEdit({...entryToEdit, dayOfWeek: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime-edit">Hora de inicio</Label>
                {isMobile ? (
                  <Select 
                    value={entryToEdit.startTime} 
                    onValueChange={(value) => setEntryToEdit({...entryToEdit, startTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`edit-start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="startTime-edit"
                    type="time"
                    value={entryToEdit.startTime}
                    onChange={(e) => setEntryToEdit({...entryToEdit, startTime: e.target.value})}
                  />
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime-edit">Hora de fin</Label>
                {isMobile ? (
                  <Select 
                    value={entryToEdit.endTime} 
                    onValueChange={(value) => setEntryToEdit({...entryToEdit, endTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`edit-end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="endTime-edit"
                    type="time"
                    value={entryToEdit.endTime}
                    onChange={(e) => setEntryToEdit({...entryToEdit, endTime: e.target.value})}
                  />
                )}
                {new Date(`2000-01-01T${entryToEdit.endTime}`) <= new Date(`2000-01-01T${entryToEdit.startTime}`) && (
                  <p className="text-xs text-destructive">La hora de fin debe ser posterior a la hora de inicio</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location-edit">Ubicación (opcional)</Label>
              <Input
                id="location-edit"
                placeholder="Aula, edificio, etc."
                value={entryToEdit.location}
                onChange={(e) => setEntryToEdit({...entryToEdit, location: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingEntry(null);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateEntry} 
              disabled={!isFormValid(false) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta clase del horario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="py-4">
              <p className="font-medium">
                {subjects.find(s => s.id === entryToEdit.subjectId)?.name || 'Materia'} - {dayNames[entryToEdit.dayOfWeek]}
              </p>
              <p className="text-sm text-muted-foreground">
                {entryToEdit.startTime} - {entryToEdit.endTime}
                {entryToEdit.location && ` | ${entryToEdit.location}`}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false);
              setEditingEntry(null);
            }}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEntry}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
