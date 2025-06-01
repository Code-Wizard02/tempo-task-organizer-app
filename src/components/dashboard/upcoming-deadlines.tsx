import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { format, isToday, isTomorrow, addDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";

export function UpcomingDeadlines() {
    const { tasks } = useTasks();

    // Filtrar tareas no completadas con fecha de vencimiento
    const pendingTasksWithDates = tasks
        .filter(task => !task.completed && task.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Agrupar por fecha de vencimiento
    const tasksByDate = pendingTasksWithDates.reduce((acc, task) => {
        const date = task.dueDate.split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, typeof tasks>);

    // Obtener las próximas 5 fechas con tareas
    const nextDates = Object.keys(tasksByDate).sort().slice(0, 5);

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "Hoy";
        if (isTomorrow(date)) return "Mañana";
        return format(date, "EEEE d 'de' MMMM", { locale: es });
    };

    const isOverdue = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        return isBefore(date, today);
    };

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Próximos Vencimientos
                </CardTitle>
                <CardDescription>Tareas con fechas de entrega cercanas</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {nextDates.length > 0 ? (
                        nextDates.map((dateStr) => (
                            <div key={dateStr} className="space-y-2">
                                <div className={`text-sm font-medium ${isOverdue(dateStr) ? 'text-red-500' : ''}`}>
                                    {getDateLabel(dateStr)}
                                </div>
                                <div className="space-y-1">
                                    {tasksByDate[dateStr].map((task) => (
                                        <div
                                            key={task.id}
                                            className="rounded-md border px-3 py-2 text-sm"
                                        >
                                            {task.title}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {task.dueTime ? `Hora: ${task.dueTime}` : 'Sin hora específica'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground py-6">
                            No hay tareas pendientes con fecha de vencimiento
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}