import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { addDays, format, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp } from "lucide-react";

export function WeeklyProductivity() {
  const { tasks } = useTasks();

  // Obtener el inicio de la semana actual (lunes)
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Crear un array con los 7 días de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfCurrentWeek, i);
    return {
      date: day,
      dayName: format(day, 'EEEEEE', { locale: es }),
      dayNumber: format(day, 'd'),
      isToday: isSameDay(day, new Date()),
      completedTasks: tasks.filter(
        task => task.completed &&
          task.updatedAt &&
          isSameDay(new Date(task.updatedAt), day)
      ).length
    };
  });

  // Encontrar el día con más tareas completadas para calcular la altura relativa
  const maxCompletedTasks = Math.max(...weekDays.map(day => day.completedTasks), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Productividad Semanal
        </CardTitle>
        <CardDescription>Tareas completadas por día esta semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-40 pt-4">
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 rounded-t-sm ${day.completedTasks > 0 ? 'bg-primary' : 'bg-muted'} ${day.isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{
                  height: `${day.completedTasks > 0 ? (day.completedTasks / maxCompletedTasks) * 100 : 4}px`,
                  minHeight: '4px'
                }}
              />
              <div className="mt-2 flex flex-col items-center">
                <span className="text-xs font-medium">{day.completedTasks}</span>
                <span className={`text-xs ${day.isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {day.dayName}
                </span>
                <span className={`text-xs ${day.isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {day.dayNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}