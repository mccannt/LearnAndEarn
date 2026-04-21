"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

type MotionGroupProps = {
  children: ReactNode;
  className?: string;
};

type MotionItemProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionGroup({ children, className }: MotionGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? undefined : "visible"}
      variants={
        prefersReducedMotion
          ? undefined
          : {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.02,
                },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className, delay = 0 }: MotionItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        prefersReducedMotion
          ? undefined
          : {
              hidden: { opacity: 0, y: 18, scale: 0.985 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.34,
                  delay,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}
