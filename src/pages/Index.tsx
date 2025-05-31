
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { ListTodo, BookOpen, Calendar, UserRound } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) {
    return null; // No renderizar nada mientras se redirige
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">TaskHub</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="outline">Iniciar sesión</Button>
          </Link>
          <Link to="/register">
            <Button>Registrarse</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10 md:py-20">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Organiza tu tiempo académico
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8">
            TaskHub te ayuda a gestionar tus tareas, materias y horarios de manera eficiente para mejorar tu rendimiento académico.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Comenzar ahora
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="bg-card transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Gestión de Tareas</h3>
              <p className="text-muted-foreground">
                Organiza tus tareas por fecha límite, prioridad y estado.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Control de Materias</h3>
              <p className="text-muted-foreground">
                Administra todas tus materias y asignaturas en un solo lugar.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Horario Interactivo</h3>
              <p className="text-muted-foreground">
                Visualiza y organiza tu horario semanal de clases.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserRound className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Información de Profesores</h3>
              <p className="text-muted-foreground">
                Gestiona la información de contacto de tus profesores.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-6 md:py-10 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>TaskHub © 2025 - Gestión de Tiempo y Tareas Academicas</p>
        </div>
      </footer>
    </div>
  );
}
