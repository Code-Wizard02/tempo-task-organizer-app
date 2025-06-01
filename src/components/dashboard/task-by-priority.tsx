import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, List } from "lucide-react";

export function TasksByPriority() {
    const { tasks } = useTasks();

    // Agrupar tareas por prioridad
    const getTasksByPriority = (priority: number) => {
        return tasks.filter(task => task.priority === priority);
    };

    const highPriorityTasks = getTasksByPriority(1);
    const mediumPriorityTasks = getTasksByPriority(2);
    const lowPriorityTasks = getTasksByPriority(3);

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1:
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            case 2:
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            case 3:
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1:
                return "Alta";
            case 2:
                return "Media";
            case 3:
                return "Baja";
            default:
                return "Sin prioridad";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <List className="mr-2 h-5 w-5" />
                    Tareas por Prioridad
                </CardTitle>
                <CardDescription>Organiza tus tareas según su nivel de urgencia</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center">
                            <Badge className={getPriorityColor(1)}>
                                {getPriorityLabel(1)}
                            </Badge>
                            <span className="ml-auto text-sm">{highPriorityTasks.length} tareas</span>
                        </div>
                        <div className="mt-2 space-y-2">
                            {highPriorityTasks.slice(0, 2).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between rounded-md border p-2"
                                >
                                    <div className="flex items-center">
                                        {task.completed ? (
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                        ) : (
                                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                        )}
                                        <span className="text-sm">{task.title}</span>
                                    </div>
                                </div>
                            ))}
                            {highPriorityTasks.length > 2 && (
                                <div className="text-xs text-muted-foreground text-right">
                                    +{highPriorityTasks.length - 2} más
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center">
                            <Badge className={getPriorityColor(2)}>
                                {getPriorityLabel(2)}
                            </Badge>
                            <span className="ml-auto text-sm">{mediumPriorityTasks.length} tareas</span>
                        </div>
                        <div className="mt-2 space-y-2">
                            {mediumPriorityTasks.slice(0, 2).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between rounded-md border p-2"
                                >
                                    <div className="flex items-center">
                                        {task.completed ? (
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                        ) : (
                                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                        )}
                                        <span className="text-sm">{task.title}</span>
                                    </div>
                                </div>
                            ))}
                            {mediumPriorityTasks.length > 2 && (
                                <div className="text-xs text-muted-foreground text-right">
                                    +{mediumPriorityTasks.length - 2} más
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center">
                            <Badge className={getPriorityColor(3)}>
                                {getPriorityLabel(3)}
                            </Badge>
                            <span className="ml-auto text-sm">{lowPriorityTasks.length} tareas</span>
                        </div>
                        <div className="mt-2 space-y-2">
                            {lowPriorityTasks.slice(0, 2).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between rounded-md border p-2"
                                >
                                    <div className="flex items-center">
                                        {task.completed ? (
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                        ) : (
                                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                        )}
                                        <span className="text-sm">{task.title}</span>
                                    </div>
                                </div>
                            ))}
                            {lowPriorityTasks.length > 2 && (
                                <div className="text-xs text-muted-foreground text-right">
                                    +{lowPriorityTasks.length - 2} más
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}