import React from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

export type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]",
        className
      )}
    >
      <InfiniteSlider gap={42} reverse speed={50} pauseOnHover>
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-8 select-none opacity-85 hover:opacity-100 transition-opacity"
            height={logo.height || 36}
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || "auto"}
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}
