
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
import Schedule from "@/pages/Schedule";
import Index from "@/pages/Index";
import { AuthProvider } from "@/contexts/auth-context";
import { TaskProvider } from "@/contexts/task-context";
import { SubjectProvider } from "@/contexts/subject-context";
import { ProfessorProvider } from "@/contexts/professor-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ScheduleProvider } from "@/contexts/schedule-context";
import Profile from "@/pages/Profile"; // Import Profile page

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SubjectProvider>
            <ProfessorProvider>
              <TaskProvider>
                <ScheduleProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
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
                      <Route path="schedule" element={<Schedule />} />
                      <Route path="profile" element={<Profile />} /> {/* Add Profile route */}
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ScheduleProvider>
              </TaskProvider>
            </ProfessorProvider>
          </SubjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
