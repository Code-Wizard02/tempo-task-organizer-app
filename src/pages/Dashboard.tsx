
import { Clock, CheckCircle, ListTodo } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TaskPieChart } from "@/components/dashboard/task-pie-chart";
import { TasksByDifficulty } from "@/components/dashboard/tasks-by-difficulty";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { useTasks } from "@/contexts/task-context";
import { useAuth } from "@/contexts/auth-context";
import { TasksByPriority } from "@/components/dashboard/task-by-priority";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { TasksBySubject } from "@/components/dashboard/task-by-subject";
import { WeeklyProductivity } from "@/components/dashboard/weekly-productivity";
import { CompletionTrendChart } from "@/components/dashboard/completition-trend-chart";
import { ActivityHeatmap } from "@/components/dashboard/activity-headmap";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const {
    getTotalTasks,
    getCompletedTasksCount,
    getPendingTasksCount
  } = useTasks();

  const totalTasks = getTotalTasks();
  const completedTasks = getCompletedTasksCount();
  const pendingTasks = getPendingTasksCount();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido, {profile?.full_name || 'Usuario'}</h2>
        <p className="text-muted-foreground">
          Aquí está el resumen de tus tareas y actividades.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Tareas"
          value={totalTasks}
          icon={<ListTodo className="w-full h-full" />}
          description="Número total de tareas registradas"
          className="hidden sm:block"
        />
        <StatsCard
          title="Tareas Completadas"
          value={completedTasks}
          icon={<CheckCircle className="w-full h-full" />}
          description="Tareas que has terminado"
        />
        <StatsCard
          title="Tareas Pendientes"
          value={pendingTasks}
          icon={<Clock className="w-full h-full" />}
          description="Tareas que debes completar"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TasksByPriority />
        {/* <UpcomingDeadlines /> */}
        <TaskPieChart
          completed={completedTasks}
          pending={pendingTasks}
          title="Progreso de Tareas"
          description="Distribución de tareas completadas vs pendientes"
        />
        <PendingTasks />
        <TasksByDifficulty />
        <TasksBySubject />
        <WeeklyProductivity />
        {/* <CompletionTrendChart /> */}
        {/* <ActivityHeatmap/> */}
      </div>
    </div>
  );
}
