import React, { useState, useEffect } from "react";
import { format, parse, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Clock,
  MapPin,
  FileText,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useSubjects } from "@/contexts/subject-context";
import { useSchedule } from "@/contexts/schedule-context";
import { useMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import {
  MultiSelectDays,
  type DayOption,
} from "@/components/ui/multi-select-days";
import { cn } from "@/lib/utils";

// Define the days of the week
const daysOfWeek: DayOption[] = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

// Map day ID to Spanish name
const dayNameMap: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

type ScheduleViewProps = {
  day: string;
  entries: any[];
  onSelectEntry: (entry: any) => void;
};

const DayScheduleView = ({
  day,
  entries,
  onSelectEntry,
}: ScheduleViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{dayNameMap[day]}</h2>
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay clases programadas para este día
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectEntry(entry)}
            >
              <CardContent className="p-4">
                <div className="w-full flex items-center gap-3">
                  <div
                    className="w-2 h-12 rounded-full"
                    style={{ backgroundColor: entry.subject?.color }}
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3 className="font-medium">{entry.subject?.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {entry.start_time} - {entry.end_time}
                        </span>
                      </div>
                    </div>

                    {entry.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1.5">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{entry.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Schedule = () => {
  const isMobile = useMobile();
  const { subjects } = useSubjects();
  const {
    scheduleEntries,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    isLoading,
  } = useSchedule();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [activeDay, setActiveDay] = useState<string>("monday");

  // Form state for adding/editing schedule entries
  const [formData, setFormData] = useState({
    subject_id: "",
    start_time: "08:00",
    end_time: "09:00",
    days_of_week: [] as string[],
    location: "",
    notes: "",
  });

  // Organize entries by day
  const entriesByDay = React.useMemo(() => {
    const result: Record<string, any[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    // Sort function for time
    const sortByTime = (a: any, b: any) => {
      return a.start_time.localeCompare(b.start_time);
    };

    if (scheduleEntries.length > 0) {
      scheduleEntries.forEach((entry) => {
        // Find the subject for this entry
        const subject = subjects.find((s) => s.id === entry.subject_id);

        // Add entry to each day it belongs to
        entry.days_of_week.forEach((day: string) => {
          if (result[day]) {
            result[day].push({
              ...entry,
              subject,
            });
          }
        });
      });

      // Sort entries by start time
      Object.keys(result).forEach((day) => {
        result[day].sort(sortByTime);
      });
    }

    return result;
  }, [scheduleEntries, subjects]);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      subject_id: "",
      start_time: "08:00",
      end_time: "09:00",
      days_of_week: [],
      location: "",
      notes: "",
    });
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle day selections
  const handleDaysChange = (days: string[]) => {
    setFormData({
      ...formData,
      days_of_week: days,
    });
  };

  // Save new schedule entry
  const handleSaveEntry = async () => {
    try {
      await addScheduleEntry({
        subject_id: formData.subject_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: formData.days_of_week,
        location: formData.location,
        notes: formData.notes,
      });

      setIsAddDialogOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Error saving schedule entry:", error);
    }
  };

  // Delete schedule entry
  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    try {
      await deleteScheduleEntry(selectedEntry.id);
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error deleting schedule entry:", error);
    }
  };

  // Update schedule entry
  const handleUpdateEntry = async () => {
    if (!selectedEntry) return;

    try {
      await updateScheduleEntry(selectedEntry.id, {
        subject_id: formData.subject_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: formData.days_of_week,
        location: formData.location,
        notes: formData.notes,
      });

      setIsEditDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error updating schedule entry:", error);
    }
  };

  // Handle entry selection for editing
  const handleSelectEntry = (entry: any) => {
    setSelectedEntry(entry);

    setFormData({
      subject_id: entry.subject_id,
      start_time: entry.start_time,
      end_time: entry.end_time,
      days_of_week: entry.days_of_week,
      location: entry.location || "",
      notes: entry.notes || "",
    });

    setIsEditDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Horario</h1>
          <p className="text-muted-foreground">
            Administra tu horario de clases aquí.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Clase
        </Button>
      </div>

      <Tabs
        defaultValue={activeDay}
        value={activeDay}
        onValueChange={setActiveDay}
        className="w-full"
      >
        <div className="bg-muted/30 rounded-lg p-1 mb-6 overflow-auto">
          <TabsList className="w-full justify-start bg-transparent h-auto p-1 gap-1">
            {daysOfWeek.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className={cn(
                  "py-2 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800",
                  "data-[state=active]:shadow-sm whitespace-nowrap"
                )}
              >
                {isMobile ? day.label.substring(0, 3) : day.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {daysOfWeek.map((day) => (
          <TabsContent key={day.id} value={day.id} className="mt-0">
            <DayScheduleView
              day={day.id}
              entries={entriesByDay[day.id] || []}
              onSelectEntry={handleSelectEntry}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Weekly Overview on Desktop */}
      {!isMobile && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Resumen Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="text-center">
                  <div className="font-medium pb-2 border-b">{day.label}</div>
                  <div className="pt-2 text-sm">
                    <div className="space-y-1">
                      {(entriesByDay[day.id] || []).length > 0 ? (
                        entriesByDay[day.id].map((entry, idx) => (
                          <div
                            key={idx}
                            className="p-1 rounded text-xs mb-1 text-white truncate"
                            style={{ backgroundColor: entry.subject?.color }}
                            title={`${entry.subject?.name} (${entry.start_time} - ${entry.end_time})`}
                          >
                            {entry.subject?.name}
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground text-xs py-2">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Class Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Clase</DialogTitle>
            <DialogDescription>
              Completa la información para agregar una nueva clase a tu horario.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Materia</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) =>
                    handleInputChange("subject_id", value)
                  }
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Selecciona una materia" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora de inicio</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      handleInputChange("start_time", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora de fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      handleInputChange("end_time", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Días de la semana</Label>
                <MultiSelectDays
                  options={daysOfWeek}
                  selected={formData.days_of_week}
                  onChange={handleDaysChange}
                  placeholder="Seleccionar días..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (opcional)</Label>
                <Input
                  id="location"
                  placeholder="Ej: Aula 101, Edificio A"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Añade notas o detalles adicionales"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex justify-between flex-wrap gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetFormData();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEntry}
              disabled={
                !formData.subject_id || formData.days_of_week.length === 0
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Clase</DialogTitle>
            <DialogDescription>
              Modifica la información de esta clase.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject-edit">Materia</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) =>
                    handleInputChange("subject_id", value)
                  }
                >
                  <SelectTrigger id="subject-edit">
                    <SelectValue placeholder="Selecciona una materia" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time-edit">Hora de inicio</Label>
                  <Input
                    id="start_time-edit"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      handleInputChange("start_time", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time-edit">Hora de fin</Label>
                  <Input
                    id="end_time-edit"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      handleInputChange("end_time", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days-edit">Días de la semana</Label>
                <MultiSelectDays
                  options={daysOfWeek}
                  selected={formData.days_of_week}
                  onChange={handleDaysChange}
                  placeholder="Seleccionar días..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-edit">Ubicación (opcional)</Label>
                <Input
                  id="location-edit"
                  placeholder="Ej: Aula 101, Edificio A"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes-edit">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes-edit"
                  placeholder="Añade notas o detalles adicionales"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteEntry}
              className="sm:mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedEntry(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateEntry}
                disabled={
                  !formData.subject_id || formData.days_of_week.length === 0
                }
              >
                Actualizar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
