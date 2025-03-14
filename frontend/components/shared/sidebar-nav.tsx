"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PieChart, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Statistics",
      href: "/statistics",
      icon: PieChart,
    },
    {
      name: "Pomodoro",
      href: "/pomodoro",
      icon: Timer,
    },
  ];

  return (
    <div className="hidden w-64 flex-col bg-white p-4 shadow-sm md:flex">
      <div className="mb-8 mx-auto">
        <h1 className="text-xl font-bold text-primary">Focus Flow</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2",
              pathname === item.href
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon className="mr-2 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
