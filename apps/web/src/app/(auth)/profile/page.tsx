"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/providers/i18n-provider";
import { Locale, LANGUAGE_LIST } from "@/locales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import {
  User,
  Shield,
  Bell,
  Lock,
  CheckCircle2,
  Save,
  Globe,
  Check,
  Sparkles,
  Camera,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AvatarSelectorModal } from "@/components/profile/avatar-selector-modal";
import { updateUserProfile } from "@/lib/user";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { locale, setLocale, t, dir } = useTranslation();

  const [activeTab, setActiveTab] = useState<
    "PERSONAL" | "LANGUAGE" | "SECURITY" | "PREFERENCES" | "PRIVACY"
  >("PERSONAL");
  const [saved, setSaved] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form states
  const [country, setCountry] = useState(user?.profile?.country || "US");
  const [bio, setBio] = useState(user?.profile?.bio || "Active gamer & digital survey earner");
  const [leaderboardVisible, setLeaderboardVisible] = useState(user?.profile?.isLeaderboardVisible ?? true);
  const [emailRewardNotifs, setEmailRewardNotifs] = useState(true);
  const [emailWithdrawalNotifs, setEmailWithdrawalNotifs] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await updateUserProfile({
        country,
        bio,
        isLeaderboardVisible: leaderboardVisible,
      });

      if (res.success || res.data) {
        useAuthStore.getState().updateUserProfile({
          country,
          bio,
          isLeaderboardVisible: leaderboardVisible,
        });
        setSaved(true);
        toast.success(t.common.saved);
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale, langName: string) => {
    setLocale(newLocale);
    toast.success(`${langName} - ${t.profile.languageSection.instantNotice}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Profile Header ──────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => setIsAvatarModalOpen(true)}
            title={locale === "ar" ? "اضغط لتغيير الصورة الشخصية" : "Click to change avatar"}
          >
            <AvatarWithFallback
              username={user?.username || "user"}
              avatarUrl={user?.profile?.avatarUrl}
              size="lg"
              className="h-16 w-16 text-xl ring-2 ring-primary/30 group-hover:ring-primary group-hover:opacity-90 transition-all shadow-md"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-5 w-5 text-white drop-shadow-md" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Camera className="h-3 w-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground">{user?.username}</h1>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                {user?.role || "MEMBER"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <p className="text-[11px] text-muted-foreground/80">
                {t.profile.memberSince} {new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", year: "numeric" })}
              </p>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                <Camera className="h-3 w-3" />
                <span>{locale === "ar" ? "تغيير الصورة" : "Change Avatar"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-start sm:text-end">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">{t.profile.accountStatus}</span>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
            ● {t.profile.verified}
          </Badge>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: t.profile.tabs.personal, value: "PERSONAL", icon: User },
          { label: t.profile.tabs.language, value: "LANGUAGE", icon: Globe, highlight: true },
          { label: t.profile.tabs.security, value: "SECURITY", icon: Lock },
          { label: t.profile.tabs.preferences, value: "PREFERENCES", icon: Bell },
          { label: t.profile.tabs.privacy, value: "PRIVACY", icon: Shield },
        ].map((tab) => {
          const isActive = activeTab === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border relative ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 font-bold"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.highlight && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Tab: Language & Region Selector ──────────────────────── */}
      {activeTab === "LANGUAGE" && (
        <Card className="border-border shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span>{t.profile.languageSection.title}</span>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    5 Languages
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {t.profile.languageSection.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Instant notice */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>{t.profile.languageSection.instantNotice}</span>
            </div>

            {/* 5 Language Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {LANGUAGE_LIST.map((lang) => {
                const isSelected = lang.code === locale;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code, lang.nativeName)}
                    className={`relative p-4 rounded-xl border text-start transition-all duration-200 flex flex-col justify-between gap-3 group ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-md shadow-primary/10 ring-2 ring-primary/20"
                        : "bg-card/70 border-border hover:border-primary/40 hover:bg-accent/20"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none select-none drop-shadow-sm group-hover:scale-110 transition-transform">
                          {lang.flag}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <span>{lang.nativeName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lang.name}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="h-6 w-6 rounded-full border border-border group-hover:border-primary/50" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/40 w-full">
                      <span className="text-muted-foreground font-medium">
                        {lang.country}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-semibold">
                        {lang.dir.toUpperCase()}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 sm:right-auto sm:left-2">
                        {/* Selected accent pill if needed */}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Language info stats */}
            <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t.profile.languageSection.currentLanguage}:</span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="text-base">{LANGUAGE_LIST.find((l) => l.code === locale)?.flag}</span>
                  <span>{LANGUAGE_LIST.find((l) => l.code === locale)?.nativeName}</span>
                  <span className="text-muted-foreground">({LANGUAGE_LIST.find((l) => l.code === locale)?.country})</span>
                </span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[11px]">
                {t.profile.languageSection.activeBadge}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tab 1: Personal Info ─────────────────────────────────── */}
      {activeTab === "PERSONAL" && (
        <Card className="border-border shadow-md">
          <form onSubmit={handleSave} noValidate>
            <CardHeader>
              <CardTitle className="text-base font-bold">{t.profile.personal.title}</CardTitle>
              <CardDescription className="text-xs">
                {t.profile.personal.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t.profile.personal.username}</Label>
                  <Input disabled value={user?.username || ""} className="h-9 text-xs bg-muted/40" />
                  <span className="text-[10px] text-muted-foreground">Usernames cannot be changed once set</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t.profile.personal.email}</Label>
                  <Input disabled value={user?.email || ""} className="h-9 text-xs bg-muted/40" />
                  <span className="text-[10px] text-muted-foreground">Primary verified contact address</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t.profile.personal.country}</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="US / UK / DE / CA / EG"
                  className="h-9 text-xs max-w-xs uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t.profile.personal.bio}</Label>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other earners about your favorite tasks"
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              {saved && (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {t.common.saved}
                </span>
              )}
              <Button type="submit" size="sm" disabled={isSavingProfile} className="ml-auto font-bold gap-1.5">
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{t.common.saving}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{t.profile.personal.saveButton}</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* ─── Tab 2: Security ─────────────────────────────────────── */}
      {activeTab === "SECURITY" && (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t.profile.security.title}</CardTitle>
            <CardDescription className="text-xs">
              {t.profile.security.desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-xs">
            <div className="p-4 rounded-xl bg-accent/5 border border-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Email Verification</h4>
                <p className="text-muted-foreground text-xs">Your registered email address is verified</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                {t.profile.verified}
              </Badge>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground">{t.profile.security.updatePass}</h4>
              <div className="space-y-2 max-w-md">
                <Input type="password" placeholder={t.profile.security.currentPass} className="h-9 text-xs" />
                <Input type="password" placeholder={t.profile.security.newPass} className="h-9 text-xs" />
                <Input type="password" placeholder={t.profile.security.confirmPass} className="h-9 text-xs" />
              </div>
              <Button size="sm" className="font-bold mt-2">
                {t.profile.security.updatePass}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-accent/5 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Two-Factor Authentication (2FA)</h4>
                  <p className="text-muted-foreground text-xs">
                    Require an authenticator app code for sensitive reward withdrawals
                  </p>
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                  Configurable in Settings
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tab 3: Notifications ─────────────────────────────────── */}
      {activeTab === "PREFERENCES" && (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t.profile.notifications.title}</CardTitle>
            <CardDescription className="text-xs">
              {t.profile.notifications.desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-bold text-foreground">{t.profile.notifications.rewardAlerts}</p>
                <p className="text-muted-foreground text-[11px]">{t.profile.notifications.rewardAlertsDesc}</p>
              </div>
              <Switch checked={emailRewardNotifs} onCheckedChange={setEmailRewardNotifs} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-bold text-foreground">{t.profile.notifications.withdrawalAlerts}</p>
                <p className="text-muted-foreground text-[11px]">{t.profile.notifications.withdrawalAlertsDesc}</p>
              </div>
              <Switch checked={emailWithdrawalNotifs} onCheckedChange={setEmailWithdrawalNotifs} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tab 4: Privacy ──────────────────────────────────────── */}
      {activeTab === "PRIVACY" && (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Privacy & Public Visibility</CardTitle>
            <CardDescription className="text-xs">
              Control whether your username appears in global platform leaderboards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-foreground">Show in Public Leaderboard</p>
                <p className="text-muted-foreground text-[11px]">
                  When enabled, your username and rank appear in the Top 10 withdrawn rankings
                </p>
              </div>
              <Switch checked={leaderboardVisible} onCheckedChange={setLeaderboardVisible} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Avatar Selector Modal ───────────────────────────────── */}
      <AvatarSelectorModal
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
      />
    </div>
  );
}
