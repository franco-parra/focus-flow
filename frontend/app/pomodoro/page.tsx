"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronDown,
  Bell,
  BellOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import SidebarNav from "@/components/shared/sidebar-nav";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export default function PomodoroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTaskId = searchParams.get("taskId");
  const initialItemId = searchParams.get("itemId");
  const initialTaskTitle = searchParams.get("taskTitle") || "Tarea";
  const initialItemTitle = searchParams.get("itemTitle") || "Ítem";

  const focusSound =
    typeof Audio !== "undefined" ? new Audio("/sounds/focus-start.mp3") : null;
  const breakSound =
    typeof Audio !== "undefined" ? new Audio("/sounds/break-start.mp3") : null;
  const countdownSound =
    typeof Audio !== "undefined" ? new Audio("/sounds/countdown.mp3") : null;

  // Estado para almacenar todas las tareas
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

  // Estado para la tarea y el ítem seleccionados actualmente
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTaskId
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    initialItemId
  );

  // Obtener la tarea y el ítem seleccionados
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null;
  const selectedItem =
    selectedTask?.items.find((item) => item.id === selectedItemId) || null;

  // Presets de tiempo
  const timePresets = [
    { focus: 25, break: 5, id: "Pomodoro" },
    { focus: 50, break: 10, id: "Long" },
    { focus: 90, break: 20, id: "Extended" },
    { focus: 1 / 12, break: 1 / 12, id: "Demo" },
  ];

  // Estado para el preset seleccionado
  const [selectedPreset, setSelectedPreset] = useState<string>("Demo");

  // Estados para el temporizador
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const preset = timePresets.find((preset) => preset.id === selectedPreset);
    return preset ? preset.focus * 60 : timePresets[0].focus * 60;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [tick, setTick] = useState(0);

  // Configuración de tiempos
  const [focusMinutes, setFocusMinutes] = useState(() => {
    const preset = timePresets.find((preset) => preset.id === selectedPreset);
    return preset ? preset.focus : timePresets[0].focus;
  });
  const [breakMinutes, setBreakMinutes] = useState(() => {
    const preset = timePresets.find((preset) => preset.id === selectedPreset);
    return preset ? preset.break : timePresets[0].break;
  });

  // Efecto para el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTick((tick) => {
          if (secondsLeft <= 1) {
            clearInterval(interval as NodeJS.Timeout);
            return tick + 1;
          }

          return tick + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, secondsLeft]);

  useEffect(() => {
    if (!isActive || isPaused) return;
    setSecondsLeft((seconds) => {
      if (seconds <= 1) {
        // Cambiar de modo cuando el temporizador llega a cero
        if (mode === "focus") {
          setMode("break");
          return breakMinutes * 60;
        } else {
          setMode("focus");
          return focusMinutes * 60;
        }
      }
      return seconds - 1;
    });
  }, [tick, isActive, isPaused]);

  useEffect(() => {
    if (!isSoundEnabled || !isActive || isPaused) return;

    if (mode === "break") {
      if (secondsLeft === breakMinutes * 60) {
        breakSound?.play();
      } else if (secondsLeft >= 1 && secondsLeft <= 3) {
        countdownSound?.play();
      }
    } else if (mode === "focus") {
      if (secondsLeft === focusMinutes * 60) {
        focusSound?.play();
      }
    }
  }, [mode, isSoundEnabled, secondsLeft, isActive, isPaused]);

  // Formatear tiempo para mostrar
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Controles del temporizador
  const startTimer = () => {
    // Si ya está activo, solo quitamos la pausa
    if (isActive) {
      setIsPaused(false);
      return;
    }

    // Si es la primera vez que se inicia
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resetTimer = (minutes?: number) => {
    setIsActive(false);
    setIsPaused(true);
    setMode("focus");
    setSecondsLeft(minutes ? minutes * 60 : focusMinutes * 60);
  };

  const applyPreset = (presetId: string) => {
    const preset = timePresets.find((preset) => preset.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setFocusMinutes(preset.focus);
      setBreakMinutes(preset.break);
      resetTimer(preset.focus);
    }
  };

  const completeItem = () => {
    // Aquí iría la lógica para marcar el ítem como completado
    // Por ahora solo redirigimos al dashboard
    router.push("/dashboard");
  };

  // Función para cambiar la tarea seleccionada
  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSelectedItemId(null); // Resetear el ítem seleccionado
  };

  // Función para cambiar el ítem seleccionado
  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleLogout = () => router.push("/");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pomodoro</h1>
          <p className="text-muted-foreground">
            Concentrate on your tasks to boost your productivity
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {mode === "focus" ? "Focus Time" : "Break Time"}
              </CardTitle>
              <CardDescription className="text-center">
                Select a task and item to start your Pomodoro session
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col space-y-6">
                {/* Task and item selection section */}
                <div className="space-y-2">
                  <h3 className="">1. Select an item from a task</h3>
                  <Select
                    onValueChange={(value) => {
                      const [taskId, itemId] = value.split("|");
                      handleTaskChange(taskId);
                      handleItemChange(itemId);
                    }}
                    value={
                      selectedTaskId && selectedItemId
                        ? `${selectedTaskId}|${selectedItemId}`
                        : undefined
                    }
                    disabled={isActive}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a task item" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectGroup key={task.id}>
                          <SelectLabel>{task.title}</SelectLabel>
                          {task.items.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={`${task.id}|${item.id}`}
                              disabled={item.completed}
                            >
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Timer configuration section */}
                <div className="space-y-2">
                  <h3 className="">2. Configure the timer</h3>
                  <Tabs defaultValue="presets" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="presets">Presets</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>
                    <TabsContent value="presets" className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {timePresets.map((preset, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedPreset === preset.id
                                ? "default"
                                : "outline"
                            }
                            onClick={() => applyPreset(preset.id)}
                            disabled={isActive}
                          >
                            {preset.id}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="custom" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Focus time: {focusMinutes} min
                            </span>
                          </div>
                          <Slider
                            value={[focusMinutes]}
                            min={5}
                            max={90}
                            step={5}
                            onValueChange={(value) => {
                              setFocusMinutes(value[0]);
                              if (mode === "focus") {
                                setSecondsLeft(value[0] * 60);
                              }
                            }}
                            disabled={isActive}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Break time: {breakMinutes} min</span>
                          </div>
                          <Slider
                            value={[breakMinutes]}
                            min={1}
                            max={30}
                            step={1}
                            onValueChange={(value) => {
                              setBreakMinutes(value[0]);
                              if (mode === "break") {
                                setSecondsLeft(value[0] * 60);
                              }
                            }}
                            disabled={isActive}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Timer section */}
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="w-full">3. Start your session</h3>
                  <div className="text-6xl font-bold">
                    {formatTime(secondsLeft)}
                  </div>

                  <div className="flex space-x-2">
                    {!isActive || isPaused ? (
                      <Button
                        onClick={startTimer}
                        size="icon"
                        variant="outline"
                        disabled={!selectedTask || !selectedItem}
                        title={
                          !selectedTask || !selectedItem
                            ? "Select a task and item first"
                            : "Start"
                        }
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseTimer}
                        size="icon"
                        variant="outline"
                        title="Pause"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => resetTimer(focusMinutes)}
                      size="icon"
                      variant="outline"
                      title="Reset"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={completeItem}
                      size="icon"
                      variant="outline"
                      disabled={!selectedTask || !selectedItem}
                      title={
                        !selectedTask || !selectedItem
                          ? "Select a task and item first"
                          : "Mark as completed"
                      }
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                      size="icon"
                      variant="outline"
                      title={isSoundEnabled ? "Disable sound" : "Enable sound"}
                    >
                      {isSoundEnabled ? <Bell /> : <BellOff />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                {mode === "focus"
                  ? "Focus on your current task"
                  : "Take a break, you deserve it"}
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
