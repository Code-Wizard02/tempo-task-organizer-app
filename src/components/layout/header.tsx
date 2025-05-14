
import React from 'react';
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { useMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTasks } from "@/contexts/task-context";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { isMobile, toggleSidebar } = useMobile();
  const { tasks } = useTasks();
  
  // Filtrar tareas que vencen en el próximo día
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  
  const today = new Date();
  
  const upcomingTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return !task.completed && dueDate <= tomorrow && dueDate >= today;
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        {isMobile && (
          <Button size="icon" variant="outline" className="mr-2" onClick={toggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {upcomingTasks.length > 0 && (
                <Badge 
                  variant="destructive"
                  className={cn(
                    "absolute -top-2 -right-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs"
                  )}
                >
                  {upcomingTasks.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b">
              <h3 className="font-medium">Notificaciones</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {upcomingTasks.length > 0 ? (
                <div className="py-2">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vence: {format(new Date(task.dueDate), "dd 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  No hay notificaciones pendientes
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <UserNav />
      </div>
    </header>
  );
}
