"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChartIcon,
  ListTodo,
  LogOut,
  Clock,
  Calendar,
  CheckCircle2,
  Timer,
} from "lucide-react";
import SidebarNav from "@/components/shared/sidebar-nav";

// Componente para gráfico de barras simple
const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function StatisticsPage() {
  const router = useRouter();

  // Datos de ejemplo para las estadísticas
  const completedTasksData = [
    { label: "Monday", value: 3 },
    { label: "Tuesday", value: 5 },
    { label: "Wednesday", value: 2 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 6 },
    { label: "Saturday", value: 1 },
    { label: "Sunday", value: 0 },
  ];

  const focusTimeData = [
    { label: "Monday", value: 120 },
    { label: "Tuesday", value: 180 },
    { label: "Wednesday", value: 90 },
    { label: "Thursday", value: 150 },
    { label: "Friday", value: 210 },
    { label: "Saturday", value: 60 },
    { label: "Sunday", value: 30 },
  ];

  const categoryData = [
    { label: "Development", value: 8 },
    { label: "Design", value: 5 },
    { label: "Meetings", value: 3 },
    { label: "Research", value: 6 },
    { label: "Others", value: 2 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">
            View your progress and productivity
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Tasks
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">21</div>
              <p className="text-xs text-muted-foreground">
                +5 since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14h 30m</div>
              <p className="text-xs text-muted-foreground">
                +2h since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pomodoro Sessions
              </CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                +8 since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                +1 since last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks by Day</CardTitle>
                <CardDescription>
                  Number of tasks completed in the last week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={completedTasksData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="time">
            <Card>
              <CardHeader>
                <CardTitle>Focus Time by Day (minutes)</CardTitle>
                <CardDescription>
                  Minutes dedicated to tasks in the last week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={focusTimeData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Category</CardTitle>
                <CardDescription>
                  Distribution of completed tasks by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={categoryData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
