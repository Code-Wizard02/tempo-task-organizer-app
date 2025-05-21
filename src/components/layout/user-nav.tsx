
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Bell, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTasks } from "@/contexts/task-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function UserNav() {
  const { user, profile, signOut } = useAuth();
  const { getOverdueTasks, getPendingTasks } = useTasks();

  if (!user) {
    return null;
  }

  const overdueTasks = getOverdueTasks();
  const pendingTasks = getPendingTasks();
  const hasTasks = overdueTasks.length > 0 || pendingTasks.length > 0;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {hasTasks && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <h3 className="font-medium">Notificaciones</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {overdueTasks.length === 0 && pendingTasks.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No tienes tareas pendientes</p>
              </div>
            ) : (
              <div className="divide-y">
                {overdueTasks.length > 0 && (
                  <div className="p-2 bg-red-500/10">
                    <h4 className="px-2 py-1 text-sm font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                      Tareas vencidas
                    </h4>
                    {overdueTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="px-2 py-1.5 hover:bg-accent rounded-md">
                        <Link to="/tasks" className="block">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex justify-between">
                            <p className="text-xs text-muted-foreground">Vencida</p>
                            <p className="text-xs font-medium text-red-500">
                              {task.dueDate} {task.dueTime}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                    {overdueTasks.length > 3 && (
                      <Link to="/tasks" className="block px-2 py-1 text-xs text-center text-muted-foreground">
                        Ver {overdueTasks.length - 3} tareas vencidas más
                      </Link>
                    )}
                  </div>
                )}
                
                {pendingTasks.length > 0 && (
                  <div className="p-2">
                    <h4 className="px-2 py-1 text-sm font-medium flex items-center">
                      Tareas próximas
                    </h4>
                    {pendingTasks.filter(task => !overdueTasks.includes(task)).slice(0, 3).map(task => (
                      <div key={task.id} className="px-2 py-1.5 hover:bg-accent rounded-md">
                        <Link to="/tasks" className="block">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex justify-between">
                            <p className="text-xs text-muted-foreground">Pendiente</p>
                            <p className="text-xs">
                              {task.dueDate} {task.dueTime}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                    {pendingTasks.length > 3 && (
                      <Link to="/tasks" className="block px-2 py-1 text-xs text-center text-muted-foreground">
                        Ver {pendingTasks.length - 3} tareas pendientes más
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-2 border-t">
            <Link to="/tasks" className="block w-full">
              <Button variant="outline" className="w-full">Ver todas las tareas</Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default UserNav;
