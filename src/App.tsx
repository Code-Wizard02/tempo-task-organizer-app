// Add Profile route to the App component
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Subjects from "@/pages/Subjects";
import Professors from "@/pages/Professors";
import Index from "@/pages/Index";
import { AuthProvider } from "@/contexts/auth-context";
import { TaskProvider } from "@/contexts/task-context";
import { SubjectProvider } from "@/contexts/subject-context";
import { ProfessorProvider } from "@/contexts/professor-context";
import { ThemeProvider } from "@/components/theme-provider";
import Profile from "@/pages/Profile";
import { MobileProvider } from "./hooks/use-mobile";
import { useEffect, useState } from "react";
import { ScheduleProvider } from "./contexts/schedule-context";
import Schedule from "./pages/Schedule";
import { NotesProvider } from "./contexts/notes-context";
import Notes from "./pages/Notes";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsAndroid(isAndroid);
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        setDeferredPrompt(null);
      });
    }
  };
  return (
    <MobileProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SubjectProvider>
              <ProfessorProvider>
                <TaskProvider>
                  <ScheduleProvider>
                    <NotesProvider>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route
                          path="/login"
                          element={
                            <AuthLayout title="Iniciar Sesión">
                              <Login />
                            </AuthLayout>
                          }
                        />
                        <Route
                          path="/register"
                          element={
                            <AuthLayout title="Crear Cuenta">
                              <Register />
                            </AuthLayout>
                          }
                        />
                        <Route path="/" element={<Layout />}>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="tasks" element={<Tasks />} />
                          <Route path="subjects" element={<Subjects />} />
                          <Route path="professors" element={<Professors />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="schedule" element={<Schedule />} />
                          <Route path="notes" element={<Notes />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      {/* Botón para instalar la PWA */}
                      {deferredPrompt && (
                        <button
                          onClick={handleInstallClick}
                          style={{
                            position: "fixed",
                            bottom: "20px",
                            right: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#1e90ff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Instalar Aplicación
                        </button>
                      )}
                    </NotesProvider>
                  </ScheduleProvider>
                </TaskProvider>
              </ProfessorProvider>
            </SubjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </MobileProvider>
  );
}

export default App;
