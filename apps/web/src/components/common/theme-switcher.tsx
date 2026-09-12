"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={`h-9 w-9 ${className}`}>
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const themes = [
    {
      id: "black",
      name: "Black (Dark)",
      color: "bg-[#0A0A0C] border-zinc-700",
      dot: "bg-indigo-500",
      description: "Obsidian & Slate",
    },
    {
      id: "mint",
      name: "Mint",
      color: "bg-white border-emerald-300",
      dot: "bg-emerald-500",
      description: "Mint Green & White",
    },
    {
      id: "aura",
      name: "Aura",
      color: "bg-white border-sky-300",
      dot: "bg-sky-500",
      description: "Sky Blue & White",
    },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 px-2.5 rounded-xl border-border bg-card hover:bg-accent/10 transition-colors text-xs font-semibold ${className}`}
        >
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${currentTheme.dot} ring-1 ring-black/20`} />
            <span className="hidden sm:inline-block">{currentTheme.name}</span>
          </div>
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl bg-card border-border shadow-xl">
        <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          Select Theme
        </div>
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs font-medium focus:bg-accent/10"
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${t.color}`}>
                  <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.description}</p>
                </div>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
