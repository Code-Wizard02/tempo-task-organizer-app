import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { useSubjects } from "@/contexts/subject-context";
import { Progress } from "@/components/ui/progress";
import { Book } from "lucide-react";

export function TasksBySubject() {
  const { tasks } = useTasks();
  const { subjects } = useSubjects();

  const tasksBySubject = subjects.map(subject => {
    const subjectTasks = tasks.filter(task => task.subjectId === subject.id);
    const completedTasks = subjectTasks.filter(task => task.completed).length;
    const totalTasks = subjectTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      subject,
      totalTasks,
      completedTasks,
      completionRate
    };
  }).filter(item => item.totalTasks > 0)
    .sort((a, b) => b.totalTasks - a.totalTasks);

  // Función para determinar el color basado en la tasa de finalización
  const getProgressColor = (completionRate: number) => {
    if (completionRate >= 75) return "bg-yellow-500";
    if (completionRate >= 50) return "bg-red-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="mr-2 h-5 w-5" />
          Tareas por Materia
        </CardTitle>
        <CardDescription>Distribución de tareas entre tus materias</CardDescription>
      </CardHeader>
      <CardContent>
        {tasksBySubject.length > 0 ? (
          <div className="space-y-4">
            {tasksBySubject.slice(0, 5).map((item) => (
              <div key={item.subject.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.subject.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.completedTasks}/{item.totalTasks} completadas
                  </span>
                </div>
                <Progress
                  value={item.completionRate}
                  className={`h-2 ${getProgressColor(item.completionRate)}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-6">
            No hay tareas asignadas a materias
          </p>
        )}
      </CardContent>
    </Card>
  );
}