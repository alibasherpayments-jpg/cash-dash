"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { useAuthStore } from "@/store/auth-store";
import { updateUserProfile } from "@/lib/user";
import { generateDiceBearUrl } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";
import { toast } from "sonner";
import {
  Camera,
  UploadCloud,
  Check,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface AvatarSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarSelectorModal({ open, onOpenChange }: AvatarSelectorModalProps) {
  const { user, updateUserAvatar } = useAuthStore();
  const { locale, dir } = useTranslation();
  const isAr = locale === "ar";

  const currentAvatar = user?.profile?.avatarUrl || null;
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [activeTab, setActiveTab] = useState<"PRESETS" | "UPLOAD">("PRESETS");
  const [activeCategory, setActiveCategory] = useState<string>("characters");
  const [isSaving, setIsSaving] = useState(false);
  const [customUploadPreview, setCustomUploadPreview] = useState<string | null>(
    currentAvatar && currentAvatar.startsWith("data:image") ? currentAvatar : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedAvatar with currentAvatar when modal opens
  React.useEffect(() => {
    if (open) {
      const existing = user?.profile?.avatarUrl || null;
      setSelectedAvatar(existing);
      if (existing && existing.startsWith("data:image")) {
        setCustomUploadPreview(existing);
        setActiveTab("UPLOAD");
      } else {
        setActiveTab("PRESETS");
      }
    }
  }, [open, user?.profile?.avatarUrl]);

  // Preset avatar collections
  const categories = useMemo(
    () => [
      {
        id: "characters",
        label: isAr ? "شخصيات ومغامرين" : "Adventurers",
        avatars: [
          generateDiceBearUrl(user?.username || "user", "avataaars"),
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka",
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Zack",
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Avery",
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Milo",
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna",
          "https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver",
        ],
      },
      {
        id: "robots",
        label: isAr ? "روبوتات وتكنولوجيا" : "Robots & Sci-Fi",
        avatars: [
          "https://api.dicebear.com/9.x/bottts/svg?seed=Gizmo",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Cyber",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Spark",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Pixel",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Byte",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Turbo",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Nova",
          "https://api.dicebear.com/9.x/bottts/svg?seed=Echo",
        ],
      },
      {
        id: "gamers",
        label: isAr ? "إيموجي وجيمرز" : "Fun Gamers",
        avatars: [
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Flame",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Champion",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Star",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Gamer",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Rocket",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lucky",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Blaze",
          "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Hero",
        ],
      },
      {
        id: "stylish",
        label: isAr ? "عصري وأنيق" : "Modern & Chic",
        avatars: [
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Maya",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Alex",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Liam",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Elena",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Noah",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Chloe",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Leo",
          "https://api.dicebear.com/9.x/lorelei/svg?seed=Zoe",
        ],
      },
    ],
    [isAr, user?.username]
  );

  // Handle client-side file upload with automatic image scaling & compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(isAr ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)" : "Please choose a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة كبير جداً، الحد الأقصى 10 ميجابايت" : "Image is too large. Maximum size is 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Offscreen canvas to crop to center-square & resize to 256x256
        const canvas = document.createElement("canvas");
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Center crop math
        const minSide = Math.min(img.width, img.height);
        const startX = (img.width - minSide) / 2;
        const startY = (img.height - minSide) / 2;

        ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, targetSize, targetSize);

        // Convert to high-quality compressed JPEG
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCustomUploadPreview(compressedDataUrl);
        setSelectedAvatar(compressedDataUrl);
        toast.success(isAr ? "تم اختيار الصورة بنجاح! اضغط على حفظ لاعتمادها." : "Image ready! Click Save to apply.");
      };
      img.src = loadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so user can pick the same file if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!selectedAvatar) {
      toast.error(isAr ? "يرجى اختيار صورة أولاً" : "Please select an avatar first");
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateUserProfile({ avatarUrl: selectedAvatar });

      if (res.success || res.data) {
        updateUserAvatar(selectedAvatar);
        toast.success(isAr ? "تم تحديث الصورة الشخصية بنجاح! 🎉" : "Profile picture updated successfully! 🎉");
        onOpenChange(false);
      } else {
        toast.error(res.message || (isAr ? "فشل تحديث الصورة الشخصية" : "Failed to update profile avatar"));
      }
    } catch (err: any) {
      console.error("Avatar save error:", err);
      toast.error(err.response?.data?.message || (isAr ? "حدث خطأ أثناء حفظ الصورة" : "Error saving avatar"));
    } finally {
      setIsSaving(false);
    }
  };

  const currentCategoryAvatars = categories.find((c) => c.id === activeCategory)?.avatars || [];
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border bg-card shadow-2xl">
        <DialogHeader className="p-5 pb-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-black text-foreground">
                {isAr ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "اختر من التشكيلة الجاهزة أو ارفع صورة خاصة بك من المعرض"
                  : "Choose from ready avatar presets or upload your own photo from device"}
              </DialogDescription>
            </div>
          </div>

          {/* Live Preview Comparison Header */}
          <div className="mt-4 p-3 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AvatarWithFallback
                username={user?.username || "user"}
                avatarUrl={currentAvatar}
                size="md"
                className="ring-2 ring-border shrink-0"
              />
              <div className="text-start">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  {isAr ? "الصورة الحالية" : "Current"}
                </span>
                <span className="text-xs font-semibold text-foreground truncate max-w-[100px] block">
                  {user?.username}
                </span>
              </div>
            </div>

            <ArrowIcon className="h-4 w-4 text-muted-foreground shrink-0" />

            <div className="flex items-center gap-2.5">
              <div className="text-end">
                <span className="text-[10px] text-primary uppercase font-bold block">
                  {isAr ? "المعاينة الجديدة" : "New Preview"}
                </span>
                <span className="text-xs font-semibold text-emerald-500 block">
                  {selectedAvatar ? (isAr ? "تم التحديد ✓" : "Selected ✓") : "—"}
                </span>
              </div>
              <AvatarWithFallback
                username={user?.username || "user"}
                avatarUrl={selectedAvatar}
                size="md"
                className="ring-2 ring-primary shadow-sm shadow-primary/30 shrink-0"
              />
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher: Presets vs Custom Upload */}
        <div className="px-5 pt-3 flex items-center gap-2 border-b border-border/40 bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveTab("PRESETS")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 relative ${
              activeTab === "PRESETS"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAr ? "الصور الجاهزة" : "Preset Avatars"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UPLOAD")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 relative ${
              activeTab === "UPLOAD"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{isAr ? "رفع من المعرض / الجهاز" : "Upload from Gallery"}</span>
            {customUploadPreview && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            )}
          </button>
        </div>

        {/* Tab 1: Preset Avatars */}
        {activeTab === "PRESETS" && (
          <div className="p-5 space-y-4 max-h-[360px] overflow-y-auto">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 pt-1">
              {currentCategoryAvatars.map((url, idx) => {
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative aspect-square p-2 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center group ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/20 ring-2 ring-primary/40 scale-105"
                        : "border-border bg-card/60 hover:border-primary/50 hover:bg-accent/10 hover:scale-102"
                    }`}
                  >
                    <AvatarWithFallback
                      username={user?.username || "user"}
                      avatarUrl={url}
                      size="lg"
                      className="transition-transform group-hover:scale-105"
                    />

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload from Device / Gallery */}
        {activeTab === "UPLOAD" && (
          <div className="p-5 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {customUploadPreview ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-4 text-center">
                <div className="relative group">
                  <AvatarWithFallback
                    username={user?.username || "user"}
                    avatarUrl={customUploadPreview}
                    size="xl"
                    className="h-24 w-24 ring-4 ring-primary shadow-lg shadow-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomUploadPreview(null);
                      if (selectedAvatar === customUploadPreview) {
                        setSelectedAvatar(currentAvatar);
                      }
                    }}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    title={isAr ? "إزالة الصورة" : "Remove photo"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {isAr ? "الصورة المرفوعة جاهزة" : "Custom Photo Ready"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAr
                      ? "تم ضغط الصورة وتنسيقها لتناسب ملفك الشخصي"
                      : "Photo optimized and scaled for optimal profile display"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold gap-2 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {isAr ? "اختيار صورة أخرى" : "Choose Another Photo"}
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary bg-card/50 hover:bg-accent/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center group"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {isAr ? "اضغط هنا لاختيار صورة من المعرض أو الجهاز" : "Click here to choose an image from device/gallery"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP {isAr ? "بحد أقصى 10 ميجابايت" : "up to 10MB"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="text-xs font-bold mt-1 gap-1.5 pointer-events-none"
                >
                  <UploadCloud className="h-4 w-4" />
                  {isAr ? "فتح المعرض" : "Browse Files"}
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="p-4 bg-muted/20 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !selectedAvatar || selectedAvatar === currentAvatar}
              className="w-full sm:w-auto font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{isAr ? "حفظ الصورة" : "Save Avatar"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
