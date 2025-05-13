
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "./user-nav";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-14 md:h-16 items-center border-b px-2 md:px-6">
      <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>
      <div className="ml-auto flex items-center space-x-1 md:space-x-2">
        {!isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>No tienes notificaciones nuevas</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <ThemeToggle />
        {user ? (
          <UserNav />
        ) : (
          <Link to="/login">
            <Button size={isMobile ? "sm" : "default"}>Iniciar Sesión</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
