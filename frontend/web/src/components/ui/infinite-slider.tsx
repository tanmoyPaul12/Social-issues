"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InfiniteSliderProps extends React.ComponentProps<"div"> {
  gap?: number;
  reverse?: boolean;
  speed?: number;
  speedOnHover?: number;
  pauseOnHover?: boolean;
  direction?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export function InfiniteSlider({
  children,
  gap = 42,
  reverse = false,
  speed = 40,
  speedOnHover,
  pauseOnHover = true,
  direction = "horizontal",
  className,
  ...props
}: InfiniteSliderProps) {
  return (
    <div
      className={cn(
        "group flex w-full overflow-hidden select-none py-2",
        pauseOnHover && "hover:[&_*]:[animation-play-state:paused]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-around",
          reverse ? "animate-infinite-slider-reverse" : "animate-infinite-slider"
        )}
        style={{
          gap: `${gap}px`,
          paddingRight: `${gap}px`,
          animationDuration: `${speed}s`,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-around",
          reverse ? "animate-infinite-slider-reverse" : "animate-infinite-slider"
        )}
        style={{
          gap: `${gap}px`,
          paddingRight: `${gap}px`,
          animationDuration: `${speed}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
