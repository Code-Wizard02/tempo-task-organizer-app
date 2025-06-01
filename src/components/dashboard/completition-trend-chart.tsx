import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { startOfMonth, subMonths, eachWeekOfInterval, format, endOfWeek, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

export function CompletionTrendChart() {
    const { tasks } = useTasks();

    // Obtener fecha de inicio (3 meses atrás) y fecha actual
    const endDate = new Date();
    const startDate = subMonths(startOfMonth(endDate), 2); // 3 meses de datos

    // Obtener todas las semanas en el intervalo
    const weekDates = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 } // Semana comienza el lunes
    );

    // Preparar los datos para el gráfico
    const data = weekDates.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

        // Si la semana está en el futuro, no incluir datos
        if (isBefore(endDate, weekStart)) return null;

        // Contar tareas completadas en esta semana
        const completedInWeek = tasks.filter((task) => {
            if (!task.completed || !task.updatedAt) return false;
            const completedDate = new Date(task.updatedAt);
            return completedDate >= weekStart && completedDate <= weekEnd;
        }).length;

        return {
            name: `${format(weekStart, 'd', { locale: es })}-${format(weekEnd, 'd MMM', { locale: es })}`,
            tareas: completedInWeek,
        };
    }).filter(Boolean); // Eliminar semanas nulas (futuras)

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Tendencia de Tareas Completadas
                </CardTitle>
                <CardDescription>
                    Tareas que has completado cada semana
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                tickCount={5}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                allowDecimals={false}
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} tareas`, 'Completadas']}
                                labelFormatter={(label) => `Semana: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="tareas"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                name="Tareas completadas"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}