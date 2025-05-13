
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchedule, WeekDay } from "@/contexts/schedule-context";
import { useSubjects } from "@/contexts/subject-context";
import { useProfessors } from "@/contexts/professor-context";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const weekDayLabels: Record<WeekDay, string> = {
  'monday': 'Lunes',
  'tuesday': 'Martes',
  'wednesday': 'Miércoles',
  'thursday': 'Jueves',
  'friday': 'Viernes',
  'saturday': 'Sábado',
  'sunday': 'Domingo',
};

const scheduleSchema = z.object({
  subjectId: z.string().min(1, { message: "Debe seleccionar una materia" }),
  professorId: z.string().min(1, { message: "Debe seleccionar un profesor" }),
  day: z.string() as z.ZodType<WeekDay>,
  startTime: z.string().min(1, { message: "Debe seleccionar una hora de inicio" }),
  endTime: z.string().min(1, { message: "Debe seleccionar una hora de fin" })
    .superRefine((endTime, ctx) => {
      const startTime = ctx.data?.startTime;
      if (startTime && endTime <= startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La hora de fin debe ser posterior a la hora de inicio"
        });
      }
    }),
  location: z.string().min(1, { message: "Debe ingresar una ubicación" }),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// Helper to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function Schedule() {
  const { scheduleEntries, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry, getEntriesByDay } = useSchedule();
  const { subjects } = useSubjects();
  const { professors } = useProfessors();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeekDay>('monday');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [availableProfessors, setAvailableProfessors] = useState<string[]>([]);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      subjectId: "",
      professorId: "",
      day: 'monday',
      startTime: "08:00",
      endTime: "10:00",
      location: "",
    },
  });

  // Update available professors when subject changes
  const watchSubjectId = form.watch("subjectId");
  React.useEffect(() => {
    if (watchSubjectId) {
      const filteredProfessors = professors
        .filter(prof => prof.subjectIds.includes(watchSubjectId))
        .map(prof => prof.id);
      
      setAvailableProfessors(filteredProfessors);
      
      // Reset professor selection if current selection is invalid
      const currentProfessorId = form.getValues("professorId");
      if (currentProfessorId && !filteredProfessors.includes(currentProfessorId)) {
        form.setValue("professorId", "");
      }
    } else {
      setAvailableProfessors([]);
      form.setValue("professorId", "");
    }
  }, [watchSubjectId, professors, form]);

  // Set day based on selected date
  React.useEffect(() => {
    if (selectedDate) {
      const dayIndex = (selectedDate.getDay() + 6) % 7; // Convert Sunday = 0 to Monday = 0
      const day = weekDays[dayIndex];
      setSelectedDay(day);
    }
  }, [selectedDate]);

  const openCreateDialog = () => {
    form.reset({
      subjectId: "",
      professorId: "",
      day: selectedDay,
      startTime: "08:00",
      endTime: "10:00",
      location: "",
    });
    setEditingEntry(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const entry = scheduleEntries.find(e => e.id === id);
    if (entry) {
      form.reset({
        subjectId: entry.subjectId,
        professorId: entry.professorId,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        location: entry.location,
      });
      setEditingEntry(id);
      setIsDialogOpen(true);
      
      // Update available professors for this subject
      const filteredProfessors = professors
        .filter(prof => prof.subjectIds.includes(entry.subjectId))
        .map(prof => prof.id);
      setAvailableProfessors(filteredProfessors);
    }
  };

  const handleDeleteEntry = (id: string) => {
    deleteScheduleEntry(id);
  };

  const onSubmit = (data: ScheduleFormValues) => {
    if (editingEntry) {
      updateScheduleEntry(editingEntry, {
        subjectId: data.subjectId,
        professorId: data.professorId,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
      });
      toast({
        title: "Horario actualizado",
        description: "La clase ha sido actualizada exitosamente",
      });
    } else {
      // Ensure all required fields are present when adding a new schedule entry
      const newEntry = {
        subjectId: data.subjectId,
        professorId: data.professorId,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
      };
      addScheduleEntry(newEntry);
      toast({
        title: "Horario actualizado",
        description: "La clase ha sido agregada exitosamente",
      });
    }
    setIsDialogOpen(false);
  };

  // Get entries for the selected day
  const entriesByDay = getEntriesByDay(selectedDay);

  // Helper to get the date for a specific weekday
  const getDateForWeekday = (day: WeekDay) => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayIndex = daysOfWeek.indexOf(day);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start with Monday
    return addDays(weekStart, dayIndex);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Desconocida';
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#cccccc';
  };

  const getProfessorName = (professorId: string) => {
    const professor = professors.find(p => p.id === professorId);
    return professor ? professor.name : 'Desconocido';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Horario</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as 'calendar' | 'list')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Agregar Clase
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {currentView === 'calendar' && (
          <>
            {/* Calendar View */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Seleccione un día</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border pointer-events-auto"
                  locale={es}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle>Clases del {weekDayLabels[selectedDay]}</CardTitle>
              </CardHeader>
              <CardContent>
                {entriesByDay.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay clases programadas para este día</p>
                    <Button onClick={openCreateDialog} variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Agregar Clase
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entriesByDay.map((entry) => (
                      <div 
                        key={entry.id}
                        className="rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        style={{ backgroundColor: `${getSubjectColor(entry.subjectId)}20` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-2 rounded-full" 
                            style={{ backgroundColor: getSubjectColor(entry.subjectId) }}
                          />
                          <div>
                            <h3 className="font-semibold">{getSubjectName(entry.subjectId)}</h3>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> 
                                {entry.startTime} - {entry.endTime}
                              </div>
                              <div>Prof. {getProfessorName(entry.professorId)}</div>
                              <div>{entry.location}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentView === 'list' && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Todas las clases</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay clases programadas</p>
                  <Button onClick={openCreateDialog} variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Clase
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {weekDays.map(day => {
                    const entries = getEntriesByDay(day);
                    if (entries.length === 0) return null;
                    
                    return (
                      <div key={day} className="space-y-2">
                        <h3 className="font-medium text-lg">{weekDayLabels[day]}</h3>
                        <div className="space-y-2">
                          {entries.map(entry => (
                            <div 
                              key={entry.id}
                              className="rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                              style={{ backgroundColor: `${getSubjectColor(entry.subjectId)}20` }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-2 rounded-full" 
                                  style={{ backgroundColor: getSubjectColor(entry.subjectId) }}
                                />
                                <div>
                                  <h4 className="font-semibold">{getSubjectName(entry.subjectId)}</h4>
                                  <div className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> 
                                      {entry.startTime} - {entry.endTime}
                                    </div>
                                    <div>Prof. {getProfessorName(entry.professorId)}</div>
                                    <div>{entry.location}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-auto">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Schedule Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Editar Clase' : 'Agregar Clase'}</DialogTitle>
            <DialogDescription>
              Complete los datos de la clase.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar materia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: subject.color }}
                              />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchSubjectId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchSubjectId ? "Seleccionar profesor" : "Primero seleccione una materia"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProfessors.length > 0 ? (
                          availableProfessors.map((profId) => {
                            const professor = professors.find(p => p.id === profId);
                            return professor ? (
                              <SelectItem key={profId} value={profId}>
                                {professor.name}
                              </SelectItem>
                            ) : null;
                          })
                        ) : (
                          <SelectItem disabled value="">
                            No hay profesores asignados a esta materia
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value as WeekDay)} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day} value={day}>
                            {weekDayLabels[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Inicio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de fin</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Fin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={`end-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Aula 101, Laboratorio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingEntry ? 'Guardar Cambios' : 'Agregar Clase'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
