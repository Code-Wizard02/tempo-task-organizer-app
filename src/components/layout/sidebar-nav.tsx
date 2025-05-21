
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ListTodo,
  BookOpen,
  UserRound,
  LayoutDashboard
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tareas",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Materias",
    href: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Profesores",
    href: "/professors",
    icon: UserRound,
  },
];

export function SidebarNav({ className, isCollapsed }: SidebarNavProps) {
  const location = useLocation();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ScrollArea className={cn("flex-1 overflow-y-auto")}>
        <div className="flex flex-col gap-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:text-primary-foreground"
                  : "hover:bg-secondary",
                isCollapsed && "justify-center py-3"
              )}
            >
              <item.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
