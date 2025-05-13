
import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

export function Layout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Obtenemos el título de la página basado en la ruta
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/tasks") return "Gestión de Tareas";
    if (path === "/subjects") return "Materias";
    if (path === "/professors") return "Profesores";
    if (path === "/schedule") return "Horario";
    if (path === "/profile") return "Mi Perfil";
    return "TaskHub";
  };

  // Si está cargando, mostramos un spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigimos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default Layout;
