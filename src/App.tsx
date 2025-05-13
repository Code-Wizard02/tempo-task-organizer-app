
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

// Contextos
import { AuthProvider } from "@/contexts/auth-context";
import { TaskProvider } from "@/contexts/task-context";
import { SubjectProvider } from "@/contexts/subject-context";
import { ProfessorProvider } from "@/contexts/professor-context";
import { ScheduleProvider } from "@/contexts/schedule-context";

// Layouts
import { Layout } from "@/components/layout/layout";

// Páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <TaskProvider>
            <SubjectProvider>
              <ProfessorProvider>
                <ScheduleProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Rutas públicas */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Rutas protegidas */}
                      <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        {/* Aquí irán las rutas adicionales como /subjects, /professors, /schedule, etc. */}
                        {/* Placeholder para futuras páginas */}
                        <Route path="/subjects" element={<div className="p-4"><h1 className="text-xl font-semibold">Página de Materias - En desarrollo</h1></div>} />
                        <Route path="/professors" element={<div className="p-4"><h1 className="text-xl font-semibold">Página de Profesores - En desarrollo</h1></div>} />
                        <Route path="/schedule" element={<div className="p-4"><h1 className="text-xl font-semibold">Página de Horario - En desarrollo</h1></div>} />
                        <Route path="/profile" element={<div className="p-4"><h1 className="text-xl font-semibold">Perfil - En desarrollo</h1></div>} />
                      </Route>

                      {/* Ruta para páginas no encontradas */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ScheduleProvider>
              </ProfessorProvider>
            </SubjectProvider>
          </TaskProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
