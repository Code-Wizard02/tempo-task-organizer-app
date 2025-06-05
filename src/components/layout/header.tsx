
// Update the header component to use the useMobile hook correctly
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggleMenu } from "@/components/theme-toggle-menu";
import { ThemeToggle } from "../theme-toggle";

type HeaderProps = {
  title: string;
  toggleSidebar?: () => void;
};

export function Header({ title, toggleSidebar }: HeaderProps) {
  const isMobile = useMobile();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {isMobile && toggleSidebar && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}

      <div className="flex-1">
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
