import { cn } from "@/lib/utils";

const LOGO_SRC = "/lamaos-logo.png";

type LamaLogoProps = {
  size?: number;
  className?: string;
  alt?: string;
};

export function LamaLogo({ size = 36, className, alt = "LamaOS" }: LamaLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}

export const LAMA_LOGO_URL = LOGO_SRC;
