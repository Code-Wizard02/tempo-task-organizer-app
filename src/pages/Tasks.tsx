import { useEffect, useState } from "react";
import {
  ListTodo,
  Check,
  Plus,
  Pencil,
  Trash,
  Clock,
  AlertCircle,
  Calendar,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks, Task, TaskDifficulty } from "@/contexts/task-context";
import { useSubjects } from "@/contexts/subject-context";
import { useProfessors } from "@/contexts/professor-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } =
    useTasks();
  const { subjects } = useSubjects();
  const { professors } = useProfessors();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [filterDifficulty, setFilterDifficulty] = useState<
    TaskDifficulty | "all"
  >("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: "23:59",
    difficulty: "medium" as TaskDifficulty,
    priority: 1,
    subjectId: "",
    professorId: "",
    completed: false,
  });
  const [filterPriority, setFilterPriority] = useState<number | "all">("all");

  // Filtrado de tareas
  const filteredTasks = tasks.filter((task) => {
    // Filtro por texto
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "pending"
          ? !task.completed
          : task.completed;

    // Filtro por dificultad
    const matchesDifficulty =
      filterDifficulty === "all" || task.difficulty === filterDifficulty;

    // Filtro por prioridad
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    return (
      matchesSearch && matchesStatus && matchesDifficulty && matchesPriority
    );
  });

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTask?.dueDate) return;

    const interval = setInterval(() => {
      const dueDate = new Date(
        `${selectedTask.dueDate}T${selectedTask.dueTime || "23:59"}`
      );
      const now = new Date();
      const diff = dueDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("¡Tiempo agotado!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTask]);

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  const calculatePriority = (taskData: {
    dueDate: string;
    dueTime?: string;
    difficulty: TaskDifficulty;
  }): number => {
    const now = new Date();
    const dueDate = new Date(`${taskData.dueDate}T${taskData.dueTime || "23:59"}`);
    const daysDifference =
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDifference < 3 && taskData.difficulty === "hard") {
      return 1; // Alta prioridad
    } else if (daysDifference < 7) {
      return 2; // Media prioridad
    } else {
      return 3; // Baja prioridad
    }
  };

  const handleAddTask = () => {

    const calculatedPriority = calculatePriority({
      dueDate: newTask.dueDate,
      dueTime: newTask.dueTime,
      difficulty: newTask.difficulty,
    });
    addTask({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      dueTime: newTask.dueTime,
      difficulty: newTask.difficulty,
      priority: calculatedPriority,
      subjectId: newTask.subjectId,
      professorId: newTask.professorId,
      completed: newTask.completed,
    });
    setIsAddDialogOpen(false);
    resetNewTask();
  };

  const handleEditTask = () => {
    if (currentTask) {
      const calculatedPriority = calculatePriority({
        dueDate: currentTask.dueDate,
        dueTime: currentTask.dueTime,
        difficulty: currentTask.difficulty,
      });

      updateTask(currentTask.id, {
        title: currentTask.title,
        description: currentTask.description,
        dueDate: currentTask.dueDate,
        dueTime: currentTask.dueTime,
        difficulty: currentTask.difficulty,
        priority: currentTask.priority,
        subjectId: currentTask.subjectId,
        professorId: currentTask.professorId,
      });
      setIsEditDialogOpen(false);
      setCurrentTask(null);
    }
  };

  const handleDeleteTask = () => {
    if (currentTask) {
      deleteTask(currentTask.id);
      setIsDeleteDialogOpen(false);
      setCurrentTask(null);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: "",
      description: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      dueTime: "23:59",
      difficulty: "medium",
      priority: 1,
      subjectId: "",
      professorId: "",
      completed: false,
    });
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask({ ...task });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setCurrentTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Actualización inteligente de profesorId basado en subjectId
  const handleSubjectChange = (subjectId: string, isNew = false) => {
    // Buscar profesores asignados a esta materia
    const subjectProfessors = professors.filter((p) =>
      p.subjectIds.includes(subjectId)
    );

    if (isNew) {
      // Para nueva tarea
      if (subjectProfessors.length === 1) {
        // Si hay un solo profesor, asignarlo automáticamente
        setNewTask({
          ...newTask,
          subjectId,
          professorId: subjectProfessors[0].id,
        });
      } else {
        // Si hay múltiples o ninguno, solo actualizar subjectId
        setNewTask({
          ...newTask,
          subjectId,
          professorId: "", // Limpiar la selección de profesor
        });
      }
    } else {
      // Para tarea existente
      if (currentTask && subjectProfessors.length === 1) {
        setCurrentTask({
          ...currentTask,
          subjectId,
          professorId: subjectProfessors[0].id,
        });
      } else if (currentTask) {
        setCurrentTask({
          ...currentTask,
          subjectId,
          professorId: "", // Limpiar la selección de profesor
        });
      }
    }
  };

  // Filtrar profesores basados en la materia seleccionada
  const getFilteredProfessors = (subjectId: string) => {
    if (!subjectId) return professors;
    return professors.filter((p) => p.subjectIds.includes(subjectId));
  };

  const getDifficultyBadge = (difficulty: TaskDifficulty) => {
    const styles = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    const labels = {
      easy: "Fácil",
      medium: "Media",
      hard: "Difícil",
    };

    return <Badge className={styles[difficulty]}>{labels[difficulty]}</Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    const styles = {
      1: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      3: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };

    const labels = {
      1: "Alta",
      2: "Media",
      3: "Baja",
    };

    return <Badge className={styles[priority]}>{labels[priority]}</Badge>;
  };

  const getStatusIcon = (completed: boolean, isOverdue: boolean) => {
    if (completed) {
      return <Check className="h-5 w-5 text-green-500" />;
    }

    if (isOverdue) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  const isTaskOverdue = (
    dueDate: string,
    dueTime: string | undefined,
    completed: boolean
  ) => {
    if (!dueDate) return false;
    if (completed) return false;

    const dueDateObj = new Date(`${dueDate}T${dueTime || "23:59"}`);
    return dueDateObj < new Date();
  };

  const formatDateTime = (date: string, time?: string) => {
    if (!date) return "";

    try {
      const dateObj = new Date(`${date}T${time || "00:00"}`);
      return `${dateObj.toLocaleDateString()} ${time || ""}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return `${date} ${time || ""}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestión de Tareas
          </h2>
          <p className="text-muted-foreground">
            Administra y organiza todas tus tareas aquí
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Tarea
        </Button>
      </div>

      {/* Card para filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros y búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Búsqueda */}
            <div className="flex relative">
              <Input
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro por estado */}
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as any)}
            >
              <SelectTrigger>
                {/* <SelectValue placeholder="Estado" /> */}
                <SelectValue>
                  {filterStatus === "all"
                    ? "Filtrar por estado"
                    : filterStatus === "pending"
                      ? "Pendientes"
                      : "Completadas"}
                </SelectValue>

              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por dificultad */}
            {/* <Select
              value={filterDifficulty}
              onValueChange={(value) => setFilterDifficulty(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select> */}

            <Select
              value={filterPriority.toString()}
              onValueChange={(value) =>
                setFilterPriority(value === "all" ? "all" : Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {filterPriority === "all"
                    ? "Filtrar por prioridad"
                    : filterPriority === 1
                      ? "Alta"
                      : filterPriority === 2
                        ? "Media"
                        : filterPriority === 3
                          ? "Baja"
                          : "Sin prioridad"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">Alta</SelectItem>
                <SelectItem value="2">Media</SelectItem>
                <SelectItem value="3">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Card para la tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center">
              <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No hay tareas</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ||
                  filterStatus !== "all" ||
                  filterDifficulty !== "all"
                  ? "No se encontraron tareas con los filtros aplicados"
                  : "Añade tu primera tarea para comenzar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Título</TableHead>
                    {/* <TableHead className="text-center">Dificultad</TableHead> */}
                    <TableHead className="text-center">Prioridad</TableHead>
                    <TableHead className="text-center">Materias</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const subject = subjects.find(
                      (s) => s.id === task.subjectId
                    );
                    const isOverdue = isTaskOverdue(
                      task.dueDate,
                      task.dueTime,
                      task.completed
                    );

                    return (
                      <TableRow
                        key={task.id}
                        className={cn(
                          "hover:bg-gray-100 dark:hover:bg-gray-700",
                          task.completed && "bg-gray-50 dark:bg-gray-800"
                        )}
                        onClick={() => {
                          openTaskDetails(task);
                        }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={task.completed}
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que el evento de clic en la fila se dispare
                            }}
                            onCheckedChange={() => {
                              toggleTaskStatus(task.id);
                            }}
                          />
                        </TableCell>

                        {/* Título */}
                        <TableCell>
                          <div
                            className={cn(
                              task.completed &&
                              "line-through text-muted-foreground"
                            )}
                          >
                            {task.title}
                          </div>
                        </TableCell>

                        {/* Dificultad */}
                        {/* <TableCell className="text-center">
                          {getDifficultyBadge(task.difficulty)}
                        </TableCell> */}

                        {/* <TableCell className="text-center">
                          {task.priority === 1
                            ? "Alta"
                            : task.priority === 2
                            ? "Media"
                            : task.priority === 3
                            ? "Baja"
                            : "Sin prioridad"}  
                        </TableCell> */}

                        <TableCell className="text-center">
                          {task.priority
                            ? getPriorityBadge(task.priority)
                            : "Sin prioridad"}
                        </TableCell>

                        {/* Materia */}
                        <TableCell className="text-center">
                          {subject ? (
                            <span
                              className="inline-block px-2 py-1 rounded-md text-xs"
                              style={{
                                backgroundColor: subject.color,
                                color: "#fff",
                              }}
                            >
                              {subject.name}
                            </span>
                          ) : (
                            "Sin materia"
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {getStatusIcon(task.completed, isOverdue)}
                            <span
                              className={cn(
                                "ml-2 text-sm",
                                isOverdue && "text-destructive font-medium"
                              )}
                            >
                              {formatDateTime(task.dueDate, task.dueTime)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento de clic en la fila se dispare
                                openEditDialog(task);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento de clic en la fila se dispare
                                openDeleteDialog(task);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para añadir una tarea */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir tarea</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear una nueva tarea
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Fecha límite</Label>
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueTime">Hora límite</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Dificultad</Label>
                <Select
                  value={newTask.difficulty}
                  onValueChange={(value) =>
                    setNewTask({
                      ...newTask,
                      difficulty: value as TaskDifficulty,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Materia</Label>
                <Select
                  value={newTask.subjectId}
                  onValueChange={(value) => handleSubjectChange(value, true)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="professor">Profesor</Label>
                <Select
                  value={newTask.professorId}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, professorId: value })
                  }
                  disabled={!newTask.subjectId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !newTask.subjectId
                          ? "Primero selecciona una materia"
                          : "Selecciona profesor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredProfessors(newTask.subjectId).length > 0 ? (
                      getFilteredProfessors(newTask.subjectId).map(
                        (professor) => (
                          <SelectItem key={professor.id} value={professor.id}>
                            {professor.name}
                          </SelectItem>
                        )
                      )
                    ) : (
                      <SelectItem value="" disabled>
                        No hay profesores asignados a esta materia
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {newTask.subjectId &&
                  getFilteredProfessors(newTask.subjectId).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Esta materia no tiene profesores asignados. Asigna un
                      profesor a esta materia primero.
                    </p>
                  )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewTask();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={
                !newTask.title || !newTask.dueDate || !newTask.subjectId
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar una tarea */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la tarea
            </DialogDescription>
          </DialogHeader>
          {currentTask && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={currentTask.title}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={currentTask.description}
                  onChange={(e) =>
                    setCurrentTask({
                      ...currentTask,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dueDate">Fecha límite</Label>
                  <div className="relative">
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={currentTask.dueDate}
                      onChange={(e) =>
                        setCurrentTask({
                          ...currentTask,
                          dueDate: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dueTime">Hora límite</Label>
                  <Input
                    id="edit-dueTime"
                    type="time"
                    value={currentTask.dueTime || "23:59"}
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        dueTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-difficulty">Dificultad</Label>
                  <Select
                    value={currentTask.difficulty}
                    onValueChange={(value) =>
                      setCurrentTask({
                        ...currentTask,
                        difficulty: value as TaskDifficulty,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-subject">Materia</Label>
                  <Select
                    value={currentTask.subjectId}
                    onValueChange={(value) => handleSubjectChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-professor">Profesor</Label>
                  <Select
                    value={currentTask.professorId}
                    onValueChange={(value) =>
                      setCurrentTask({ ...currentTask, professorId: value })
                    }
                    disabled={!currentTask.subjectId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !currentTask.subjectId
                            ? "Primero selecciona una materia"
                            : "Selecciona profesor"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredProfessors(currentTask.subjectId).length >
                        0 ? (
                        getFilteredProfessors(currentTask.subjectId).map(
                          (professor) => (
                            <SelectItem key={professor.id} value={professor.id}>
                              {professor.name}
                            </SelectItem>
                          )
                        )
                      ) : (
                        <SelectItem value="" disabled>
                          No hay profesores asignados a esta materia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {currentTask.subjectId &&
                    getFilteredProfessors(currentTask.subjectId).length ===
                    0 && (
                      <p className="text-xs text-muted-foreground">
                        Esta materia no tiene profesores asignados. Asigna un
                        profesor a esta materia primero.
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentTask(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditTask}
              disabled={
                !currentTask?.title ||
                !currentTask?.dueDate ||
                !currentTask?.subjectId
              }
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para eliminar una tarea */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {currentTask && (
            <div className="py-4">
              <p className="font-medium">{currentTask.title}</p>
              <p className="text-sm text-muted-foreground">
                {currentTask.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCurrentTask(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles de la tarea */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la tarea</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {/* Título */}
              <Card className="p-4 col-span-2 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Título
                </p>
                <p className="text-lg font-semibold">{selectedTask.title}</p>
              </Card>

              {/* Descripción */}
              <Card className="p-4 col-span-2 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Descripción
                </p>
                <p className="text-base">
                  {selectedTask.description || "Sin descripción"}
                </p>
              </Card>

              {/* Fecha límite */}
              {/* <Card className="p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Fecha límite
                </p>
                <p className="text-base">
                  {formatDateTime(selectedTask.dueDate, selectedTask.dueTime)}
                </p>
              </Card> */}
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Tiempo restante */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tiempo restante
                    </p>
                    <p className="text-base">{timeLeft || "Calculando..."}</p>
                  </div>
                </div>
              </Card>

              {/* Dificultad */}
              <Card className="p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Dificultad
                </p>
                <Badge
                  className={cn(
                    selectedTask.difficulty === "easy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : selectedTask.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  )}
                >
                  {selectedTask.difficulty === "easy"
                    ? "Fácil"
                    : selectedTask.difficulty === "medium"
                      ? "Media"
                      : "Difícil"}
                </Badge>
              </Card>

              {/* Materia */}
              <Card className="p-4 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Materia
                </p>
                <p className="text-base">
                  {subjects.find((s) => s.id === selectedTask.subjectId)
                    ?.name || "Sin materia"}
                </p>
              </Card>

              {/* Profesor */}
              <Card className="p-4 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Profesor
                </p>
                <p className="text-base">
                  {professors.find((p) => p.id === selectedTask.professorId)
                    ?.name || "Sin profesor"}
                </p>
              </Card>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
