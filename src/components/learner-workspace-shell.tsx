import type { ReactNode } from "react";

import Link from "next/link";
import {
  BookOpen,
  Calculator,
  Gift,
  Home,
  Palette,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type LearnerSection =
  | "home"
  | "avatar"
  | "rewards"
  | "progress"
  | "math"
  | "english";

type LearnerMetric = {
  label: string;
  value: string;
};

type LearnerWorkspaceShellProps = {
  title: string;
  description: string;
  icon: ReactNode;
  currentSection: LearnerSection;
  accent?: "sky" | "violet" | "orange" | "emerald" | "rose";
  actions?: ReactNode;
  metrics?: LearnerMetric[];
  children: ReactNode;
};

const sections: Array<{
  id: LearnerSection;
  href: string;
  label: string;
  icon: typeof Home;
}> = [
  { id: "home", href: "/", label: "Home", icon: Home },
  { id: "math", href: "/math", label: "Math", icon: Calculator },
  { id: "english", href: "/english", label: "English", icon: BookOpen },
  { id: "avatar", href: "/avatar", label: "Avatar", icon: Palette },
  { id: "rewards", href: "/rewards", label: "Rewards", icon: Gift },
  { id: "progress", href: "/progress", label: "Progress", icon: TrendingUp },
];

const accentClasses: Record<NonNullable<LearnerWorkspaceShellProps["accent"]>, string> = {
  sky: "from-sky-500 via-cyan-400 to-emerald-300",
  violet: "from-violet-500 via-fuchsia-400 to-pink-300",
  orange: "from-orange-500 via-amber-400 to-yellow-300",
  emerald: "from-emerald-500 via-teal-400 to-cyan-300",
  rose: "from-rose-500 via-pink-400 to-violet-300",
};

const accentGlowClasses: Record<NonNullable<LearnerWorkspaceShellProps["accent"]>, string> = {
  sky: "from-sky-200/85 via-cyan-200/50 to-emerald-200/10 dark:from-sky-500/14 dark:via-cyan-500/10 dark:to-emerald-500/5",
  violet: "from-violet-200/90 via-fuchsia-200/55 to-pink-200/10 dark:from-violet-500/14 dark:via-fuchsia-500/10 dark:to-pink-500/5",
  orange: "from-orange-200/90 via-amber-200/55 to-yellow-200/10 dark:from-orange-500/14 dark:via-amber-500/10 dark:to-yellow-500/5",
  emerald: "from-emerald-200/90 via-teal-200/55 to-cyan-200/10 dark:from-emerald-500/14 dark:via-teal-500/10 dark:to-cyan-500/5",
  rose: "from-rose-200/90 via-pink-200/55 to-violet-200/10 dark:from-rose-500/14 dark:via-pink-500/10 dark:to-violet-500/5",
};

const accentTextClasses: Record<NonNullable<LearnerWorkspaceShellProps["accent"]>, string> = {
  sky: "text-sky-800 dark:text-sky-200",
  violet: "text-violet-800 dark:text-violet-200",
  orange: "text-orange-800 dark:text-orange-200",
  emerald: "text-emerald-800 dark:text-emerald-200",
  rose: "text-rose-800 dark:text-rose-200",
};

export function LearnerWorkspaceShell({
  title,
  description,
  icon,
  currentSection,
  accent = "violet",
  actions,
  metrics = [],
  children,
}: LearnerWorkspaceShellProps) {
  const currentLabel = sections.find((section) => section.id === currentSection)?.label ?? "Studio";

  return (
    <div className="app-grid relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff8e2_0%,#fff2f7_34%,#eef7ff_72%,#eef9f3_100%)] px-4 py-6 text-slate-900 md:px-8 md:py-8 dark:bg-[linear-gradient(180deg,#120f20_0%,#131c2e_38%,#0f172a_100%)] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating-orb absolute left-[-7rem] top-[-4rem] h-56 w-56 rounded-full bg-yellow-200/60 blur-3xl dark:bg-yellow-400/10" />
        <div className="floating-orb absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-fuchsia-200/50 blur-3xl dark:bg-fuchsia-500/10" style={{ animationDelay: "1.8s" }} />
        <div className="floating-orb absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" style={{ animationDelay: "4.2s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.65),transparent_25%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_25%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6">
        <section className="app-shell surface-noise overflow-hidden rounded-[2.35rem]">
          <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-r opacity-95", accentGlowClasses[accent])} />
          <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-gradient-to-r from-white/0 via-white/85 to-white/0 dark:via-white/15" />
          <div className="relative border-b border-white/70 px-5 py-5 dark:border-white/10 md:px-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-600 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Learner Mode
                  </Badge>
                  <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", accentTextClasses[accent], "border-white/80 bg-white/65 dark:border-white/10 dark:bg-white/5")}>
                    Play Studio
                  </Badge>
                  <span className="rounded-full border border-white/60 bg-white/50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    Explore. Learn. Redeem.
                  </span>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="flex items-start gap-4">
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br text-white shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/50", accentClasses[accent])}>
                      {icon}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-5xl">
                          {title}
                        </h1>
                        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                          {description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sections.map((section) => {
                          const SectionIcon = section.icon;
                          const active = currentSection === section.id;

                          return (
                            <Button
                              key={section.id}
                              asChild
                              variant="outline"
                              className={cn(
                                "rounded-full border-white/85 bg-white/72 text-slate-700 shadow-none transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
                                active &&
                                  cn(
                                    "border-transparent text-white shadow-lg shadow-slate-900/10 dark:text-slate-950",
                                    "bg-gradient-to-r",
                                    accentClasses[accent],
                                  ),
                              )}
                            >
                              <Link href={section.href}>
                                <SectionIcon className="mr-2 h-4 w-4" />
                                {section.label}
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="panel-elevated rounded-[1.85rem] border border-white/75 bg-white/58 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/42">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                          Current Scene
                        </div>
                        <div className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">
                          {currentLabel}
                        </div>
                      </div>
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-1 ring-white/40", accentClasses[accent])}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Keep your next action obvious and your progress visible from every learner page.
                    </p>
                    <div className="mt-4 grid gap-2">
                      <div className="flex items-center justify-between rounded-[1.2rem] border border-white/70 bg-white/65 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Open sections</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-50">{sections.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-[1.2rem] border border-white/70 bg-white/65 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Focus mode</span>
                        <span className={cn("font-semibold", accentTextClasses[accent])}>{currentLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start rounded-[1.5rem] border border-white/70 bg-white/55 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                {actions}
                <ThemeToggle />
              </div>
            </div>
          </div>

          {metrics.length > 0 ? (
            <div className="grid gap-px border-t border-white/70 bg-white/60 dark:border-white/10 dark:bg-white/10 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric, index) => (
                <div key={metric.label} className="metric-tile relative px-5 py-5 md:px-7">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {metric.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                    {metric.value}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Live studio readout
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", accentClasses[accent])}
                      style={{ width: `${Math.min(92, 55 + index * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {children}
      </div>
    </div>
  );
}
