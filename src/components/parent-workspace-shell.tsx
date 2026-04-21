import type { ReactNode } from "react";

import Link from "next/link";
import { BookOpen, LayoutGrid, Package2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkspaceSection = "dashboard" | "content" | "catalog";

type WorkspaceMetric = {
  label: string;
  value: string;
};

type ParentWorkspaceShellProps = {
  title: string;
  description: string;
  icon: ReactNode;
  currentSection: WorkspaceSection;
  actions?: ReactNode;
  metrics?: WorkspaceMetric[];
  children: ReactNode;
};

const sections: Array<{
  id: WorkspaceSection;
  href: string;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { id: "dashboard", href: "/parent", label: "Dashboard", icon: LayoutGrid },
  { id: "content", href: "/parent/content", label: "Content", icon: BookOpen },
  { id: "catalog", href: "/parent/catalog", label: "Catalog", icon: Package2 },
];

export function ParentWorkspaceShell({
  title,
  description,
  icon,
  currentSection,
  actions,
  metrics = [],
  children,
}: ParentWorkspaceShellProps) {
  const currentLabel = sections.find((section) => section.id === currentSection)?.label ?? "Dashboard";

  return (
    <div className="app-grid relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f4ec_0%,#f9fbfc_42%,#eef4f2_100%)] px-4 py-6 text-slate-900 md:px-8 md:py-8 dark:bg-[linear-gradient(180deg,#081116_0%,#101a21_45%,#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating-orb absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-amber-200/45 blur-3xl dark:bg-amber-500/10" />
        <div className="floating-orb absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" style={{ animationDelay: "1.6s" }} />
        <div className="floating-orb absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/10" style={{ animationDelay: "4.4s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6">
        <section className="app-shell surface-noise overflow-hidden rounded-[2.35rem]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(110deg,rgba(245,158,11,0.18),rgba(16,185,129,0.14),rgba(56,189,248,0.06))] dark:bg-[linear-gradient(110deg,rgba(245,158,11,0.12),rgba(16,185,129,0.08),rgba(56,189,248,0.04))]" />
          <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-gradient-to-r from-white/0 via-white/85 to-white/0 dark:via-white/15" />
          <div className="relative border-b border-slate-200/70 px-5 py-5 dark:border-white/10 md:px-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-slate-300/70 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-600 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Parent Workspace
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-amber-300/60 bg-amber-100/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                    Control Deck
                  </Badge>
                  <span className="rounded-full border border-slate-300/60 bg-white/55 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    Calm oversight
                  </span>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.55rem] border border-white/60 bg-[linear-gradient(135deg,#10212b_0%,#22575c_55%,#d68c45_100%)] text-white shadow-lg shadow-slate-900/10 dark:border-white/10">
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
                          const active = section.id === currentSection;

                          return (
                            <Button
                              key={section.id}
                              asChild
                              variant="outline"
                              className={cn(
                                "rounded-full border-slate-300/70 bg-white/65 text-slate-700 shadow-none transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
                                active &&
                                  "border-transparent bg-[linear-gradient(135deg,#10212b_0%,#22575c_55%,#d68c45_100%)] text-white shadow-lg shadow-slate-900/10 hover:bg-[linear-gradient(135deg,#10212b_0%,#22575c_55%,#d68c45_100%)] dark:text-white",
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

                  <div className="panel-elevated rounded-[1.85rem] border border-white/70 bg-white/58 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                          Current Workspace
                        </div>
                        <div className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">
                          {currentLabel}
                        </div>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10212b_0%,#22575c_55%,#d68c45_100%)] text-white shadow-lg ring-1 ring-white/35">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Manage child profiles, session limits, content, and catalog changes from one operations surface.
                    </p>
                    <div className="mt-4 grid gap-2">
                      <div className="flex items-center justify-between rounded-[1.2rem] border border-white/70 bg-white/65 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Workspace map</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-50">{sections.length} views</span>
                      </div>
                      <div className="flex items-center justify-between rounded-[1.2rem] border border-white/70 bg-white/65 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Active mode</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-200">{currentLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {actions ? (
                <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-white/70 bg-white/55 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>

          {metrics.length > 0 ? (
            <div className="grid gap-px border-t border-slate-200/70 bg-slate-200/70 dark:border-white/10 dark:bg-white/10 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric, index) => (
                <div key={metric.label} className="metric-tile relative px-5 py-5 md:px-7">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                    {metric.value}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Ops snapshot
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-slate-200/90 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#10212b_0%,#22575c_55%,#d68c45_100%)]"
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
