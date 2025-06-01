
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/task-context";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Clock } from "lucide-react";

export function TasksByDifficulty() {
  const { tasks, getTasksByDifficulty } = useTasks();

  const easyTasks = getTasksByDifficulty("easy");
  const mediumTasks = getTasksByDifficulty("medium");
  const hardTasks = getTasksByDifficulty("hard");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Media";
      case "hard":
        return "Difícil";
      default:
        return difficulty;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="mr-2 h-5 w-5" />
          Tareas por Dificultad</CardTitle>
        <CardDescription>Organiza tus tareas según su nivel de dificultad</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <div className="flex items-center">
              <Badge className={getDifficultyColor("easy")}>
                {getDifficultyLabel("easy")}
              </Badge>
              <span className="ml-auto text-sm">{easyTasks.length} tareas</span>
            </div>
            <div className="mt-2 space-y-2">
              {easyTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center">
                    {task.completed ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{task.title}</span>
                  </div>
                </div>
              ))}
              {easyTasks.length > 2 && (
                <div className="text-xs text-muted-foreground text-right">
                  +{easyTasks.length - 2} más
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Badge className={getDifficultyColor("medium")}>
                {getDifficultyLabel("medium")}
              </Badge>
              <span className="ml-auto text-sm">{mediumTasks.length} tareas</span>
            </div>
            <div className="mt-2 space-y-2">
              {mediumTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center">
                    {task.completed ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{task.title}</span>
                  </div>
                </div>
              ))}
              {mediumTasks.length > 2 && (
                <div className="text-xs text-muted-foreground text-right">
                  +{mediumTasks.length - 2} más
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Badge className={getDifficultyColor("hard")}>
                {getDifficultyLabel("hard")}
              </Badge>
              <span className="ml-auto text-sm">{hardTasks.length} tareas</span>
            </div>
            <div className="mt-2 space-y-2">
              {hardTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center">
                    {task.completed ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{task.title}</span>
                  </div>
                </div>
              ))}
              {hardTasks.length > 2 && (
                <div className="text-xs text-muted-foreground text-right">
                  +{hardTasks.length - 2} más
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
