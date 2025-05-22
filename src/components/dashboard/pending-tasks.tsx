
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { useSubjects } from "@/contexts/subject-context";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function PendingTasks() {
  const { getPendingTasks } = useTasks();
  const { getSubject } = useSubjects();
  
  const pendingTasks = getPendingTasks()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Tareas Pendientes</CardTitle>
        <CardDescription>Próximas tareas a completar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tienes tareas pendientes</p>
          ) : (
            pendingTasks.map((task) => {
              const subject = getSubject(task.subjectId);
              const daysUntilDue = Math.ceil(
                (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={task.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {subject && (
                        <span 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: subject.color }} 
                        />
                      )}
                      <span>{subject?.name}</span>
                    </div>
                  </div>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        daysUntilDue <= 1 ? "text-destructive border-destructive" : 
                        daysUntilDue <= 3 ? "text-yellow-600 border-yellow-600" : 
                        "text-muted-foreground"
                      )}
                    >
                      {daysUntilDue <= 0
                        ? "Vencida"
                        : formatDistance(new Date(task.dueDate), new Date(), {
                            addSuffix: true,
                            locale: es,
                          })}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
          
          {pendingTasks.length > 0 && (
            <div className="pt-2">
              {/* <a href="/tasks" className="text-sm text-primary hover:underline">
                Ver todas las tareas
              </a> */}
              <Link to="/tasks" className="block w-full">
                <Button variant="outline" className="w-full">Ver todas las tareas</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
