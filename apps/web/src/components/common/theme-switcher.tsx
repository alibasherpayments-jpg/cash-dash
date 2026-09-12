"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Check, Sparkles, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

export interface ThemeOption {
  id: string;
  nameEn: string;
  nameAr: string;
  type: "dark" | "light";
  descriptionEn: string;
  descriptionAr: string;
  bgHex: string;
  cardHex: string;
  primaryHex: string;
  accentHex: string;
  previewClass: string;
  dotClass: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "black",
    nameEn: "Obsidian Black",
    nameAr: "الأسود الأوبسيديان",
    type: "dark",
    descriptionEn: "Deep fintech obsidian with indigo accent",
    descriptionAr: "أسود داكن عميق مع لمسات نيلية عصرية",
    bgHex: "#0a0a0c",
    cardHex: "#141416",
    primaryHex: "#6366f1",
    accentHex: "#f59e0b",
    previewClass: "bg-[#0a0a0c] border-zinc-800",
    dotClass: "bg-indigo-500",
  },
  {
    id: "mint",
    nameEn: "Fresh Mint",
    nameAr: "النعناع المنعش",
    type: "light",
    descriptionEn: "Clean mint green & crisp white surface",
    descriptionAr: "أخضر نعناعي مشرق مع خلفية بيضاء ناصعة",
    bgHex: "#ffffff",
    cardHex: "#ffffff",
    primaryHex: "#10b981",
    accentHex: "#059669",
    previewClass: "bg-white border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  {
    id: "aura",
    nameEn: "Sky Aura",
    nameAr: "الأفق السماوي",
    type: "light",
    descriptionEn: "Ice blue & crystal clean light surface",
    descriptionAr: "أزرق سماوي كريستالي ناصع ومهدئ للعين",
    bgHex: "#f8fafc",
    cardHex: "#ffffff",
    primaryHex: "#0ea5e9",
    accentHex: "#38bdf8",
    previewClass: "bg-slate-50 border-sky-200",
    dotClass: "bg-sky-500",
  },
  {
    id: "cyberpunk",
    nameEn: "Cyberpunk Neon",
    nameAr: "نيون سايبر",
    type: "dark",
    descriptionEn: "Electric cyan & neon magenta futurism",
    descriptionAr: "سماوي كهربائي وماجنتا نيون بتقنية مستقبلية",
    bgHex: "#0d0517",
    cardHex: "#170a2b",
    primaryHex: "#00f0ff",
    accentHex: "#ff007f",
    previewClass: "bg-[#0d0517] border-cyan-500/30",
    dotClass: "bg-cyan-400",
  },
  {
    id: "amethyst",
    nameEn: "Amethyst Velvet",
    nameAr: "المخمل البنفسجي",
    type: "dark",
    descriptionEn: "Galactic purple & luminous violet glow",
    descriptionAr: "بنفسجي ملكي داكن مع توهج أرجواني ساحر",
    bgHex: "#0e0a17",
    cardHex: "#161026",
    primaryHex: "#a855f7",
    accentHex: "#c084fc",
    previewClass: "bg-[#0e0a17] border-purple-500/30",
    dotClass: "bg-purple-500",
  },
  {
    id: "crimson",
    nameEn: "Ruby Crimson",
    nameAr: "أحمر قرمزي فاخر",
    type: "dark",
    descriptionEn: "Stealth dark with fiery ruby & coral",
    descriptionAr: "كربون داكن فخم مع لمعان ياقوتي أحمر ناري",
    bgHex: "#12080a",
    cardHex: "#1c0d10",
    primaryHex: "#f43f5e",
    accentHex: "#fb923c",
    previewClass: "bg-[#12080a] border-rose-500/30",
    dotClass: "bg-rose-500",
  },
  {
    id: "sunset",
    nameEn: "Solar Sunset",
    nameAr: "غروب الشمس",
    type: "dark",
    descriptionEn: "Warm charcoal with radiant solar amber",
    descriptionAr: "فحم دافئ مع توهج كهرماني ذهبي ساحر",
    bgHex: "#120d09",
    cardHex: "#1c140d",
    primaryHex: "#f59e0b",
    accentHex: "#fb923c",
    previewClass: "bg-[#120d09] border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  {
    id: "emerald",
    nameEn: "Emerald Obsidian",
    nameAr: "الزمرد الداكن",
    type: "dark",
    descriptionEn: "Forest obsidian & bioluminescent green",
    descriptionAr: "أسود غابي عميق مع وميض زمردي أخضر",
    bgHex: "#05120c",
    cardHex: "#0a1d13",
    primaryHex: "#10b981",
    accentHex: "#34d399",
    previewClass: "bg-[#05120c] border-emerald-500/30",
    dotClass: "bg-emerald-400",
  },
  {
    id: "abyss",
    nameEn: "Ocean Abyss",
    nameAr: "أزرق المحيط العميق",
    type: "dark",
    descriptionEn: "Oceanic navy & electric cerulean blue",
    descriptionAr: "كحلي بحري عميق مع أزرق كهربائي متلألئ",
    bgHex: "#080d1a",
    cardHex: "#0e162b",
    primaryHex: "#0ea5e9",
    accentHex: "#38bdf8",
    previewClass: "bg-[#080d1a] border-sky-500/30",
    dotClass: "bg-sky-400",
  },
  {
    id: "royale",
    nameEn: "Golden Royale",
    nameAr: "الذهبي الملكي",
    type: "dark",
    descriptionEn: "Luxury onyx & imperial champagne gold",
    descriptionAr: "أونيكس أسود فاخر مع ذهب ملكي إمبراطوري",
    bgHex: "#0e0c08",
    cardHex: "#18150d",
    primaryHex: "#eab308",
    accentHex: "#facc15",
    previewClass: "bg-[#0e0c08] border-yellow-500/30",
    dotClass: "bg-yellow-400",
  },
  {
    id: "rose",
    nameEn: "Rose Quartz",
    nameAr: "روز كوارتز ناعم",
    type: "light",
    descriptionEn: "Chic Parisian blush & berry rose",
    descriptionAr: "وردي لؤلؤي ناعم وفخم مريح للقراءة",
    bgHex: "#fff7f8",
    cardHex: "#ffffff",
    primaryHex: "#f43f5e",
    accentHex: "#fb7185",
    previewClass: "bg-[#fff7f8] border-rose-200",
    dotClass: "bg-rose-400",
  },
  {
    id: "arctic",
    nameEn: "Arctic Frost",
    nameAr: "الجليد النوردي",
    type: "light",
    descriptionEn: "Crisp Nordic ice & deep glacier blue",
    descriptionAr: "جليد قطبي ناصع مع أزرق جليدي مهدئ",
    bgHex: "#f0f9ff",
    cardHex: "#ffffff",
    primaryHex: "#0284c7",
    accentHex: "#38bdf8",
    previewClass: "bg-[#f0f9ff] border-sky-200",
    dotClass: "bg-sky-500",
  },
  {
    id: "synthwave",
    nameEn: "Retro Synthwave",
    nameAr: "سينث ويف 80s",
    type: "dark",
    descriptionEn: "Laser pink & neon cyan 80s retro",
    descriptionAr: "أجواء الثمانينات الكلاسيكية بالوردي والنيون",
    bgHex: "#0e0b1c",
    cardHex: "#18122d",
    primaryHex: "#ec4899",
    accentHex: "#06b6d4",
    previewClass: "bg-[#0e0b1c] border-pink-500/30",
    dotClass: "bg-pink-500",
  },
];

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "dark" | "light">("all");
  const carouselRef = useRef<HTMLDivElement>(null);

  const isAr = locale === "ar";

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === theme) || THEMES[0];
  }, [theme]);

  const filteredThemes = useMemo(() => {
    if (filter === "dark") return THEMES.filter((t) => t.type === "dark");
    if (filter === "light") return THEMES.filter((t) => t.type === "light");
    return THEMES;
  }, [filter]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -140 : 140;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={`h-9 w-9 ${className}`}>
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const currentName = isAr ? currentTheme.nameAr : currentTheme.nameEn;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 px-2.5 rounded-xl border-border bg-card hover:bg-accent/10 transition-colors text-xs font-semibold ${className}`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${currentTheme.dotClass} ring-2 ring-background ring-offset-1 ring-offset-black/10`}
            />
            <span className="hidden sm:inline-block max-w-[110px] truncate">
              {currentName}
            </span>
          </div>
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[330px] sm:w-[370px] p-3 rounded-2xl bg-card/95 backdrop-blur-xl border-border shadow-2xl space-y-2.5 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              {isAr ? "اختيار المظهر" : "Select Theme"}
            </h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {THEMES.length}
            </span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              onClick={(e) => {
                e.preventDefault();
                setFilter("all");
              }}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                filter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setFilter("dark");
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors ${
                filter === "dark"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-2.5 w-2.5" />
              <span>{isAr ? "داكن" : "Dark"}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setFilter("light");
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors ${
                filter === "light"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="h-2.5 w-2.5" />
              <span>{isAr ? "فاتح" : "Light"}</span>
            </button>
          </div>
        </div>

        {/* 1. Horizontal Scroll Carousel Bar (Quick Theme Picker) */}
        <div className="relative group">
          <div
            ref={carouselRef}
            className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar-horizontal pb-1.5 px-0.5 scroll-smooth"
          >
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              const title = isAr ? t.nameAr : t.nameEn;
              return (
                <button
                  key={`pill-${t.id}`}
                  onClick={() => setTheme(t.id)}
                  title={title}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/30"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${t.dotClass} ring-1 ring-black/20`}
                    style={{ backgroundColor: t.primaryHex }}
                  />
                  <span className="whitespace-nowrap">{title}</span>
                </button>
              );
            })}
          </div>

          {/* Carousel Left/Right indicators for mouse */}
          <button
            onClick={() => scrollCarousel("left")}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-card/80 backdrop-blur border border-border items-center justify-center text-muted-foreground hover:text-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            onClick={() => scrollCarousel("right")}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-card/80 backdrop-blur border border-border items-center justify-center text-muted-foreground hover:text-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* 2. Main Vertical Scrollable List (Fluid Custom Scrollbar) */}
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
          {filteredThemes.map((t) => {
            const isActive = theme === t.id;
            const title = isAr ? t.nameAr : t.nameEn;
            const desc = isAr ? t.descriptionAr : t.descriptionEn;

            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-all border ${
                  isActive
                    ? "bg-accent/15 border-primary/40 ring-1 ring-primary/20 shadow-sm"
                    : "hover:bg-accent/10 border-transparent hover:border-border/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Theme Preview Swatch */}
                  <div
                    className="h-8 w-8 rounded-lg border flex items-center justify-center relative shadow-inner shrink-0 overflow-hidden"
                    style={{ backgroundColor: t.bgHex, borderColor: t.primaryHex + "44" }}
                  >
                    {/* Interior mini preview */}
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: t.primaryHex }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: t.accentHex }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-foreground truncate">{title}</p>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          t.type === "dark"
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                        }`}
                      >
                        {t.type === "dark" ? (isAr ? "داكن" : "Dark") : isAr ? "فاتح" : "Light"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Dual Color Swatch Dots */}
                  <div className="flex items-center -space-x-1">
                    <span
                      className="h-3 w-3 rounded-full border border-black/20 ring-1 ring-background"
                      style={{ backgroundColor: t.primaryHex }}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-black/20 ring-1 ring-background"
                      style={{ backgroundColor: t.accentHex }}
                    />
                  </div>

                  {isActive ? (
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="h-5 w-5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="pt-1 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span>{isAr ? "التنقل بالسحب والتمرير السلس" : "Smooth scroll enabled"}</span>
          <span className="font-semibold text-foreground/80">
            {isAr ? "13 ثيم فريد" : "13 Unique Themes"}
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
