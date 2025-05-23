import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Define el tipo de props
interface PendingTaskItemProps {
  task: any; // Idealmente debería ser un tipo más específico
  subject: any;
  dueDateLocal: Date;
  daysUntilDue: number;
  timeUntilDue: string;
}

// Exportamos el componente para que pueda ser importado
export function PendingTaskItem({ 
  task, 
  subject, 
  dueDateLocal, 
  daysUntilDue, 
  timeUntilDue 
}: PendingTaskItemProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = dueDateLocal.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("¡Tiempo agotado!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      
      setTimeLeft(
        `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [dueDateLocal]);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          {task.title}
        </p>
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
            timeLeft === "¡Tiempo agotado!"
              ? "text-destructive border-destructive"
              : daysUntilDue <= 1
              ? "text-yellow-600 border-yellow-600"
              : "text-green-600 border-green-600"
          )}
        >
          {timeLeft || "Calculando..."}
        </Badge>
      </div>
    </div>
  );
}