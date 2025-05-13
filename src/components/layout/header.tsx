
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

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-16 items-center border-b px-4 md:px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center space-x-2">
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
        <ThemeToggle />
        {user ? (
          <UserNav />
        ) : (
          <Link to="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
