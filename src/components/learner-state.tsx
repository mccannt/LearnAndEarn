"use client";

import type { ReactNode } from "react";

import { Sparkles } from "lucide-react";

import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { Skeleton } from "@/components/ui/skeleton";

type LearnerEmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export function LearnerEmptyState({
  title,
  description,
  icon = <Sparkles className="h-6 w-6" />,
}: LearnerEmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/80 bg-white/65 px-5 py-10 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/35">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white/85 text-violet-600 shadow-sm dark:bg-white/5 dark:text-violet-200">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

export function LearnerLoadingGrid() {
  return (
    <MotionGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <MotionItem key={index}>
          <div className="rounded-[1.75rem] border border-white/80 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/35">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="mt-4 h-10 w-32 rounded-2xl" />
            <Skeleton className="mt-4 h-3 w-full rounded-full" />
          </div>
        </MotionItem>
      ))}
    </MotionGroup>
  );
}
