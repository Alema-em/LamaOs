import type { ReactNode } from "react";
import { LamaLogo } from "@/components/LamaLogo";
import { cn } from "@/lib/utils";

type LamaMarkProps = {
  size?: number;
  showName?: boolean;
  nameClassName?: string;
  subtitle?: ReactNode;
  className?: string;
};

/** Logo + optional LamaOS wordmark — used in nav, auth, sidebar. */
export function LamaMark({
  size = 36,
  showName = true,
  nameClassName,
  subtitle,
  className,
}: LamaMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LamaLogo size={size} alt="" aria-hidden />
      {showName && (
        <div className="min-w-0">
          <div className={cn("font-display leading-none", nameClassName ?? "text-lg")}>LamaOS</div>
          {subtitle}
        </div>
      )}
    </div>
  );
}
