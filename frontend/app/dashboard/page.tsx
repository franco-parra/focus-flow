"use client";

import SidebarNav from "@/components/shared/sidebar-nav";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { z } from "zod";
import { CreateTaskForm, EditTaskForm } from "@/components/forms/task-form";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Timer,
  CalendarIcon,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
interface Item {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  items: Item[];
  expanded?: boolean;
}

const calculateProgress = (task: Task) => {
  if (task.items.length === 0) return 0;
  const completedItems = task.items.filter((item) => item.completed).length;
  return Math.round((completedItems / task.items.length) * 100);
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Desarrollar aplicación web",
      description: "Crear una aplicación web con React y Next.js",
      dueDate: "2025-04-15",
      items: [
        { id: "1-1", title: "Configurar proyecto Next.js", completed: true },
        { id: "1-2", title: "Diseñar componentes UI", completed: true },
        { id: "1-3", title: "Implementar autenticación", completed: true },
        { id: "1-4", title: "Crear API endpoints", completed: true },
      ],
    },
    {
      id: "2",
      title: "Preparar presentación de ventas",
      description: "Preparar presentación para la reunión de ventas trimestral",
      dueDate: "2025-03-20",
      items: [
        {
          id: "2-1",
          title: "Investigar tendencias del mercado",
          completed: true,
        },
        {
          id: "2-2",
          title: "Crear diapositivas con datos de ventas",
          completed: true,
        },
        {
          id: "2-3",
          title: "Practicar presentación con equipo de ventas",
          completed: false,
        },
      ],
    },
    {
      id: "3",
      title: "Planificar campaña de marketing",
      description:
        "Planificar campaña de marketing para el lanzamiento de nuevo producto",
      dueDate: "2025-05-10",
      items: [
        { id: "3-1", title: "Definir público objetivo", completed: true },
        {
          id: "3-2",
          title: "Crear contenido para redes sociales",
          completed: false,
        },
        { id: "3-3", title: "Programar publicaciones", completed: false },
        { id: "3-4", title: "Analizar resultados", completed: false },
      ],
    },
    {
      id: "4",
      title: "Organizar taller de capacitación",
      description: "Organizar taller de capacitación para nuevos empleados",
      dueDate: "2025-04-01",
      items: [
        { id: "4-1", title: "Definir temario del taller", completed: true },
        {
          id: "4-2",
          title: "Preparar materiales de capacitación",
          completed: true,
        },
        { id: "4-3", title: "Reservar sala de capacitación", completed: true },
        {
          id: "4-4",
          title: "Enviar invitaciones a nuevos empleados",
          completed: false,
        },
      ],
    },
    {
      id: "5",
      title: "Desarrollar prototipo de aplicación móvil",
      description:
        "Desarrollar prototipo de aplicación móvil para iOS y Android",
      dueDate: "2025-06-15",
      items: [
        { id: "5-1", title: "Diseñar interfaz de usuario", completed: false },
        {
          id: "5-2",
          title: "Implementar funcionalidades básicas",
          completed: false,
        },
        {
          id: "5-3",
          title: "Realizar pruebas de usabilidad",
          completed: false,
        },
      ],
    },
    {
      id: "6",
      title: "Redactar informe financiero",
      description: "Redactar informe financiero del último trimestre",
      dueDate: "2025-03-31",
      items: [
        { id: "6-1", title: "Recopilar datos financieros", completed: true },
        {
          id: "6-2",
          title: "Analizar datos y crear gráficos",
          completed: true,
        },
        { id: "6-3", title: "Redactar informe ejecutivo", completed: false },
        { id: "6-4", title: "Revisar y editar informe", completed: false },
      ],
    },
  ]);

  const [newItemText, setNewItemText] = useState("");
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [originalTask, setOriginalTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const toggleTaskExpand = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
  };

  const startEditTask = (task: Task) => {
    // Save a deep copy of the original state to be able to restore it
    setOriginalTask(JSON.parse(JSON.stringify(task)));
    setEditingTask({ ...task });
  };

  const restoreOriginalTask = () => {
    if (originalTask) {
      setEditingTask({ ...originalTask });
    }
  };

  const startPomodoro = (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const item = task?.items.find((i) => i.id === itemId);

    if (task && item) {
      router.push(
        `/pomodoro?taskId=${taskId}&itemId=${itemId}&taskTitle=${encodeURIComponent(
          task.title
        )}&itemTitle=${encodeURIComponent(item.title)}`
      );
    }
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const TaskCard = ({
    task,
    onToggleExpand,
    onEdit,
    onStartPomodoro,
  }: {
    task: Task;
    onToggleExpand: (taskId: string) => void;
    onEdit: (task: Task) => void;
    onStartPomodoro: (taskId: string, itemId: string) => void;
  }) => {
    const progress = calculateProgress(task);

    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                aria-label="Editar tarea"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                disabled={task.items.length === 0}
                variant="ghost"
                size="icon"
                onClick={() => task.items.length > 0 && onToggleExpand(task.id)}
                aria-label={task.expanded ? "Contraer tarea" : "Expandir tarea"}
              >
                {task.expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CardDescription className="flex items-center mt-1">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-right">{progress}% completado</p>

          {task.expanded && (
            <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {task.description}
              </p>

              <div className="space-y-2">
                {task.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <div className="flex items-center">
                      <span
                        className={
                          item.completed ? "line-through text-gray-400" : ""
                        }
                      >
                        {item.title}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStartPomodoro(task.id, item.id)}
                        disabled={item.completed}
                        aria-label="Iniciar Pomodoro"
                      >
                        <Timer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleCreateTask = async (task: Task) => {
    setIsCreating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTasks([...tasks, task]);
      setIsCreateDialogOpen(false);
      toast.success("Task creation", {
        description: "The task was successfully created.",
      });
    } catch (error) {
      toast.error("Task creation", {
        description: "There was an error during the task creation.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleModifyTask = async (task: Task) => {
    setIsModifying(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTasks(
        tasks.map((currentTask) => {
          if (currentTask.id === task.id) {
            return task;
          }
          return currentTask;
        })
      );
      // setEditingTask(null);
      setOriginalTask(task);
      toast.success("Task modification", {
        description: "The task was successfully modified.",
      });
    } catch (error) {
      toast.error("Task creation", {
        description: "There was an error during the task modification.",
      });
    } finally {
      setIsModifying(false);
    }
  };

  const numColumns = 3;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleDelete = async (taskId: string) => {
    setIsDeleting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const taskToDelete = tasks.find((task) => task.id === taskId);
      if (!taskToDelete) {
        throw new Error("The task does not exist.");
      }
      setDeletedTasks([...deletedTasks, taskToDelete]);
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task removal", {
        description: "The task has been removed.",
      });
    } catch (error) {
      toast.error("Task deletion", {
        description: "There was an error during the task deletion.",
      });
    } finally {
      setIsDeleting(false);
    }

    setEditingTask(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <SidebarNav onLogout={handleLogout} />

      {/* Floating button for new task */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add the details of your new task.
            </DialogDescription>
          </DialogHeader>
          {
            <CreateTaskForm
              onSubmit={handleCreateTask}
              isCreating={isCreating}
            />
          }
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track your progress
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="flex gap-4">
              {Array.from({ length: numColumns }, (_, c) => (
                <div className="flex-1 flex flex-col gap-4" key={c}>
                  {tasks
                    .filter((_, i) => i % numColumns === c)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleExpand={toggleTaskExpand}
                        onEdit={startEditTask}
                        onStartPomodoro={startPomodoro}
                      />
                    ))}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <div className="flex gap-4">
              {Array.from({ length: numColumns }, (_, c) => (
                <div className="flex-1 flex flex-col gap-4" key={c}>
                  {tasks
                    .filter((task) => calculateProgress(task) !== 100)
                    .filter((_, i) => i % numColumns === c)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleExpand={toggleTaskExpand}
                        onEdit={startEditTask}
                        onStartPomodoro={startPomodoro}
                      />
                    ))}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="flex gap-4">
              {Array.from({ length: numColumns }, (_, c) => (
                <div className="flex-1 flex flex-col gap-4" key={c}>
                  {tasks
                    .filter((task) => calculateProgress(task) === 100)
                    .filter((_, i) => i % numColumns === c)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleExpand={toggleTaskExpand}
                        onEdit={startEditTask}
                        onStartPomodoro={startPomodoro}
                      />
                    ))}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog to edit task */}
      <Dialog
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Modify the details of your task and its items.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <EditTaskForm
              task={editingTask}
              isDeleting={isDeleting}
              isModifying={isModifying}
              onSubmit={handleModifyTask}
              onDelete={handleDelete}
              onRestore={restoreOriginalTask}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
