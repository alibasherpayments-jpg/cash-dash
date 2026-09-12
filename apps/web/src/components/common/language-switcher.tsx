"use client";

import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
}

export function LanguageSwitcher({
  className,
  variant = "ghost",
  showLabel = true,
}: LanguageSwitcherProps) {
  const { locale, config, languages, setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            "h-9 px-2.5 gap-2 rounded-lg border border-border/50 hover:bg-accent/40 font-medium transition-all duration-150",
            className
          )}
          title="Change Language / تغيير اللغة"
        >
          <span className="text-base leading-none select-none">{config.flag}</span>
          {showLabel && (
            <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
              {config.nativeName}
            </span>
          )}
          <Globe className="h-3.5 w-3.5 opacity-60 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 backdrop-blur-xl bg-card/95 border-border/60 shadow-xl">
        <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1 flex items-center justify-between">
          <span>Select Language</span>
          <span>اختر اللغة</span>
        </div>
        {languages.map((lang) => {
          const isActive = lang.code === locale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={cn(
                "flex items-center justify-between px-2.5 py-2 rounded-md text-sm cursor-pointer transition-colors",
                isActive
                  ? "bg-primary/15 text-primary font-semibold"
                  : "hover:bg-accent/50 text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none select-none">{lang.flag}</span>
                <div className="flex flex-col text-start leading-tight">
                  <span className="text-xs font-semibold">{lang.nativeName}</span>
                  <span className="text-[10px] text-muted-foreground">{lang.country}</span>
                </div>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
