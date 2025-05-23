
import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import moment from 'moment';
import 'moment/locale/es';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useSubjects } from '@/contexts/subject-context';
import { useSchedule } from '@/contexts/schedule-context';
import { useMobile } from '@/hooks/use-mobile';
import type { Subject, ScheduleEntry as ScheduleEntryType } from '@/types/app-types';

// Define the days of the week
const daysOfWeek = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

// Create event type for the calendar
type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    subjectId: string;
    subjectColor: string;
    location?: string;
    notes?: string;
    scheduleEntryId: string;
  };
};

// Set up moment locale
moment.locale('es');
const localizer = momentLocalizer(moment);

const Schedule = () => {
  const { isMobile } = useMobile();
  const { subjects } = useSubjects();
  const { scheduleEntries, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry, isLoading } = useSchedule();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Form state for adding/editing schedule entries
  const [formData, setFormData] = useState({
    subject_id: '',
    start_time: '08:00',
    end_time: '09:30',
    days_of_week: [] as string[],
    location: '',
    notes: ''
  });

  // Reset form data
  const resetFormData = () => {
    setFormData({
      subject_id: '',
      start_time: '08:00',
      end_time: '09:30',
      days_of_week: [],
      location: '',
      notes: ''
    });
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle day checkbox changes
  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const days = [...prev.days_of_week];
      const index = days.indexOf(day);
      
      if (index === -1) {
        days.push(day);
      } else {
        days.splice(index, 1);
      }
      
      return {
        ...prev,
        days_of_week: days
      };
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
        notes: formData.notes
      });
      
      setIsAddDialogOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Error saving schedule entry:", error);
    }
  };

  // Delete schedule entry
  const handleDeleteEntry = async () => {
    if (!selectedEvent) return;
    
    try {
      await deleteScheduleEntry(selectedEvent.resource.scheduleEntryId);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting schedule entry:", error);
    }
  };

  // Update schedule entry
  const handleUpdateEntry = async () => {
    if (!selectedEvent) return;
    
    try {
      await updateScheduleEntry(selectedEvent.resource.scheduleEntryId, {
        subject_id: formData.subject_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: formData.days_of_week,
        location: formData.location,
        notes: formData.notes
      });
      
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating schedule entry:", error);
    }
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    // Find the schedule entry
    const entry = scheduleEntries.find(e => e.id === event.resource.scheduleEntryId);
    
    if (entry) {
      setFormData({
        subject_id: entry.subject_id,
        start_time: entry.start_time,
        end_time: entry.end_time,
        days_of_week: entry.days_of_week,
        location: entry.location || '',
        notes: entry.notes || ''
      });
      
      setIsEditDialogOpen(true);
    }
  };

  // Convert schedule entries to calendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];
    
    // Get the current date and start of the week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
    
    // Function to get day number (0-6) from day name
    const getDayNumber = (day: string): number => {
      const dayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0
      };
      return dayMap[day] ?? -1;
    };
    
    // Parse time string to hours and minutes
    const parseTime = (timeStr: string): { hours: number, minutes: number } => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return { hours, minutes };
    };
    
    // Loop through each schedule entry
    scheduleEntries.forEach(entry => {
      // Get the subject details
      const subject = subjects.find(s => s.id === entry.subject_id);
      if (!subject) return;
      
      // Parse start and end times
      const startTime = parseTime(entry.start_time);
      const endTime = parseTime(entry.end_time);
      
      // Create events for each day of the week that this class occurs
      entry.days_of_week.forEach(day => {
        const dayNumber = getDayNumber(day);
        if (dayNumber === -1) return;
        
        // Calculate the date for this occurrence (based on current week)
        let eventDate = new Date(weekStart);
        eventDate.setDate(weekStart.getDate() + ((dayNumber - 1 + 7) % 7));
        
        // Set the start time
        const startDate = new Date(eventDate);
        startDate.setHours(startTime.hours, startTime.minutes, 0, 0);
        
        // Set the end time
        const endDate = new Date(eventDate);
        endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
        
        // Add the event
        calendarEvents.push({
          id: `${entry.id}-${day}`,
          title: subject.name,
          start: startDate,
          end: endDate,
          resource: {
            subjectId: subject.id,
            subjectColor: subject.color || '#3B82F6',
            location: entry.location,
            notes: entry.notes,
            scheduleEntryId: entry.id
          }
        });
      });
    });
    
    return calendarEvents;
  }, [scheduleEntries, subjects]);

  // Event style customization
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.subjectColor,
        borderRadius: '4px',
        color: '#fff',
        border: 'none',
        display: 'block',
        fontWeight: 'bold'
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mi Horario</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Agregar Clase
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="h-[calc(100vh-220px)]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView={isMobile ? "day" : "week"}
              views={['day', 'week']}
              min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
              max={new Date(0, 0, 0, 22, 0, 0)} // End at 10 PM
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              culture="es"
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) => {
                  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
                },
                dayFormat: (date) => format(date, 'EEE', { locale: es }),
              }}
            />
          </div>
        </CardContent>
      </Card>

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
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Materia</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => handleInputChange('subject_id', value)}
                >
                  <SelectTrigger>
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
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora de fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días de la semana</Label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.id}`}
                        checked={formData.days_of_week.includes(day.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDayToggle(day.id);
                          } else {
                            handleDayToggle(day.id);
                          }
                        }}
                      />
                      <Label htmlFor={`day-${day.id}`}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (opcional)</Label>
                <Input
                  id="location"
                  placeholder="Ej: Aula 101, Edificio A"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Añade notas o detalles adicionales"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex justify-between flex-wrap gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetFormData();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEntry} disabled={!formData.subject_id || formData.days_of_week.length === 0}>
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
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Materia</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => handleInputChange('subject_id', value)}
                >
                  <SelectTrigger>
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
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora de fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días de la semana</Label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-day-${day.id}`}
                        checked={formData.days_of_week.includes(day.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDayToggle(day.id);
                          } else {
                            handleDayToggle(day.id);
                          }
                        }}
                      />
                      <Label htmlFor={`edit-day-${day.id}`}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación (opcional)</Label>
                <Input
                  id="edit-location"
                  placeholder="Ej: Aula 101, Edificio A"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Añade notas o detalles adicionales"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={handleDeleteEntry} className="sm:mr-auto">
              Eliminar
            </Button>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedEvent(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateEntry} disabled={!formData.subject_id || formData.days_of_week.length === 0}>
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
