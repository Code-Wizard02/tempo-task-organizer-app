
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "../theme-toggle";
import { ChevronLeft, ChevronRight, Bell, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const isMobile = useIsMobile();
  // En móviles, iniciar con la barra lateral colapsada
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const { user } = useAuth();
  
  // Actualizar el estado cuando cambie el tamaño de la pantalla
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div
      className={cn(
        "flex h-screen border-r transition-all duration-300 ease-in-out relative bg-sidebar",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col w-full">
        <div className={cn("h-14 flex items-center px-4", 
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-primary">TaskHub</span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={isCollapsed ? "ml-0" : "ml-auto"}
            title={isCollapsed ? "Expandir" : "Colapsar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <SidebarNav isCollapsed={isCollapsed} />
        </ScrollArea>

        <Separator />

        <div className={cn("p-4 flex", isCollapsed ? "justify-center" : "justify-between")}>
          {user ? (
            <>
              {!isCollapsed && <span className="text-sm font-medium truncate">{user.name}</span>}
              <div className={cn("flex space-x-1 items-center", isCollapsed && "flex-col space-y-2 space-x-0")}>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              {!isCollapsed && <span className="text-sm font-medium">Invitado</span>}
              <div className={cn("flex space-x-1 items-center", isCollapsed && "flex-col space-y-2 space-x-0")}>
                <Link to="/login">
                  <Button variant="ghost" size="icon">
                    <LogIn className="h-5 w-5" />
                  </Button>
                </Link>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
