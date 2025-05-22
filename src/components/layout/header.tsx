
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
import { ThemeToggle } from '../theme-toggle';

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
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle/>
        <UserNav />
      </div>
    </header>
  );
}
