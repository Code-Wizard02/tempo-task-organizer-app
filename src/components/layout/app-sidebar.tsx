
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const { isMobile } = useMobile();
  // En móviles, iniciar con la barra lateral colapsada
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const { user, profile } = useAuth();
  
  // Actualizar el estado cuando cambie el tamaño de la pantalla
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  // Get initials from profile.full_name if available, or use fallback
  const initials = profile?.full_name 
    ? profile.full_name.split(" ").map((name) => name[0]).join("").toUpperCase()
    : "U";

  return (
    <div
      className={cn(
        "flex h-screen border-r transition-all duration-300 ease-in-out relative bg-background dark:bg-[hsl(211,83.6%,6.4%)]",
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

        {user && (
          <div className={cn(
            "p-4",
            isCollapsed ? "flex justify-center items-center" : "flex items-center"
          )}>
            <Link to="/profile" className={cn(
              "flex items-center gap-3 hover:bg-accent/50 rounded-lg p-2 transition-colors",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile?.full_name || "User"} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{profile?.full_name || 'Usuario'}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              )}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
