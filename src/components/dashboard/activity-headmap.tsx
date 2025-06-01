import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { addDays, format, subDays, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ActivityHeatmap() {
    const { tasks } = useTasks();
    const [activityData, setActivityData] = useState<{ date: Date, count: number }[]>([]);

    useEffect(() => {
        // Obtener datos de los últimos 70 días (10 semanas)
        const endDate = new Date();
        const startDate = subDays(endDate, 69); // 70 días incluyendo hoy

        // Crear array de fechas para estos 70 días
        const dates = [];
        for (let i = 0; i <= 69; i++) {
            dates.push(addDays(startDate, i));
        }

        // Contar las tareas completadas por día
        const completionData = dates.map(date => {
            const count = tasks.filter(task => {
                return task.completed &&
                    task.updatedAt &&
                    isSameDay(parseISO(task.updatedAt), date);
            }).length;

            return { date, count };
        });

        setActivityData(completionData);
    }, [tasks]);

    // Encontrar el valor máximo para escalar los colores
    const maxCount = Math.max(...activityData.map(d => d.count), 1);

    // Función para determinar el color basado en la cantidad de tareas completadas
    const getActivityColor = (count: number) => {
        if (count === 0) return "bg-gray-100 dark:bg-gray-800";
        const intensity = Math.min(count / maxCount, 1); // valor entre 0 y 1

        if (intensity < 0.25) return "bg-blue-100 dark:bg-blue-900";
        if (intensity < 0.5) return "bg-blue-300 dark:bg-blue-700";
        if (intensity < 0.75) return "bg-blue-500 dark:bg-blue-500";
        return "bg-blue-700 dark:bg-blue-300";
    };

    // Organizar los datos en semanas (10 columnas de 7 días)
    const weeks = [];
    for (let i = 0; i < 10; i++) {
        weeks.push(activityData.slice(i * 7, (i + 1) * 7));
    }

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Flame className="mr-2 h-5 w-5" />
                    Mapa de Actividad
                </CardTitle>
                <CardDescription>
                    Tu historial de tareas completadas (últimas 10 semanas)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    <div className="text-xs text-muted-foreground mb-1 flex justify-between px-1">
                        <span>Lun</span>
                        <span className="ml-6">Mié</span>
                        <span className="ml-6">Vie</span>
                        <span>Dom</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((day, dayIdx) => (
                                    <TooltipProvider key={dayIdx}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`w-6 h-6 rounded-sm ${getActivityColor(day.count)}`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                {format(day.date, "d MMMM yyyy", { locale: es })}: {day.count} {day.count === 1 ? "tarea completada" : "tareas completadas"}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end items-center mt-4 text-sm">
                        <span className="mr-2">Menos</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800" />
                            <div className="w-4 h-4 rounded-sm bg-blue-100 dark:bg-blue-900" />
                            <div className="w-4 h-4 rounded-sm bg-blue-300 dark:bg-blue-700" />
                            <div className="w-4 h-4 rounded-sm bg-blue-500 dark:bg-blue-500" />
                            <div className="w-4 h-4 rounded-sm bg-blue-700 dark:bg-blue-300" />
                        </div>
                        <span className="ml-2">Más</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}