import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { File, Clock9, ChartNoAxesColumn } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">Focus Flow</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-600">
            Boost your productivity with AI-powered task management and Pomodoro
            timing. Complete more in less time with intelligent task breakdown.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login?mode=signup">Create Account</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-5xl">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit mx-auto">
              <File />
            </div>
            <h3 className="text-xl font-bold">AI Task Breakdown</h3>
            <p className="text-muted-foreground">
              Automatically generate task items from your task description using
              AI.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit mx-auto">
              <Clock9 />
            </div>
            <h3 className="text-xl font-bold">Pomodoro Timer</h3>
            <p className="text-muted-foreground">
              Focus on one task at a time with built-in Pomodoro technique
              timing.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit mx-auto">
              <ChartNoAxesColumn />
            </div>
            <h3 className="text-xl font-bold">Productivity Stats</h3>
            <p className="text-muted-foreground">
              Track your progress with detailed statistics on completed tasks.
            </p>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Focus Flow. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}
