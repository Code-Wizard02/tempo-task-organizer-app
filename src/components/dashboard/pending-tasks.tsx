import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { useSubjects } from "@/contexts/subject-context";
import { Badge } from "@/components/ui/badge";
import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { PendingTaskItem } from "./pendingTaskItem";

export function PendingTasks() {
  const { getPendingTasks } = useTasks();
  const { getSubject } = useSubjects();

  const pendingTasks = getPendingTasks()
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  const timeZone = "America/Mexico_City";

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Tareas Pendientes</CardTitle>
        <CardDescription>Próximas tareas a completar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No tienes tareas pendientes
            </p>
          ) : (
            pendingTasks.map((task) => {
              const subject = getSubject(task.subjectId);
              const dueDateLocal = toZonedTime(
                new Date(`${task.dueDate}T${task.dueTime || "00:00"}`),
                timeZone
              );
              const nowLocal = toZonedTime(new Date(), timeZone);

              const daysUntilDue = Math.ceil(
                (dueDateLocal.getTime() - nowLocal.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              const timeUntilDue = formatDistanceStrict(
                nowLocal,
                dueDateLocal,
                {
                  addSuffix: true,
                  locale: es,
                }
              );
              return (
                <PendingTaskItem 
                  key={task.id}
                  task={task}
                  subject={subject}
                  dueDateLocal={dueDateLocal}
                  daysUntilDue={daysUntilDue}
                  timeUntilDue={timeUntilDue}
                />
              );
            })
          )}

          {pendingTasks.length > 0 && (
            <div className="pt-2">
              <Link to="/tasks" className="block w-full">
                <Button variant="outline" className="w-full">
                  Ver todas las tareas
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

//               const [timeLeft, setTimeLeft] = useState<string | null>(null);

//               useEffect(() => {
//                 const interval = setInterval(() => {
//                   const now = new Date();
//                   const diff = dueDateLocal.getTime() - now.getTime();

//                   if (diff <= 0) {
//                     setTimeLeft("¡Tiempo agotado!");
//                     clearInterval(interval);
//                     return;
//                   }

//                   const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//                   const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//                   const minutes = Math.floor((diff / (1000 * 60)) % 60);
                  

//                   setTimeLeft(
//                     `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m`
//                   );
//                 }, 1000);

//                 return () => clearInterval(interval);
//               }, [dueDateLocal]);

//               return (
//                 <div key={task.id} className="flex items-center space-x-4">
//                   <div className="flex-1 space-y-1">
//                     <p className="text-sm font-medium leading-none">
//                       {task.title}
//                     </p>
//                     <div className="flex items-center text-xs text-muted-foreground">
//                       {subject && (
//                         <span
//                           className="w-2 h-2 rounded-full mr-1"
//                           style={{ backgroundColor: subject.color }}
//                         />
//                       )}
//                       <span>{subject?.name}</span>
//                     </div>
//                   </div>
//                   <div>
//                     {/* <Badge
//                       variant="outline"
//                       className={cn(
//                         daysUntilDue <= 0
//                           ? "text-destructive border-destructive"
//                           : daysUntilDue <= 1
//                           ? "text-yellow-600 border-yellow-600"
//                           : daysUntilDue > 1
//                           ? "text-green-600 border-green-600"
//                           : "text-muted-foreground"
//                       )}
//                     >
//                       {daysUntilDue <= 0
//                         ? "Vencida"
//                         : timeUntilDue.replace("hace", "En")}
//                     </Badge> */}

//                     <Badge
//                       variant="outline"
//                       className={cn(
//                         timeLeft === "¡Tiempo agotado!"
//                           ? "text-destructive border-destructive"
//                           : daysUntilDue <= 1
//                           ? "text-yellow-600 border-yellow-600"
//                           : "text-green-600 border-green-600"
//                       )}
//                     >
//                       {timeLeft || "Calculando..."}
//                     </Badge>
//                   </div>
//                 </div>
//               );
//             })
//           )}

//           {pendingTasks.length > 0 && (
//             <div className="pt-2">
//               <Link to="/tasks" className="block w-full">
//                 <Button variant="outline" className="w-full">
//                   Ver todas las tareas
//                 </Button>
//               </Link>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
