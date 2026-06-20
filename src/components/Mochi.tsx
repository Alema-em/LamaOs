import { motion } from "framer-motion";

interface Props {
  size?: number;
  mood?: "calm" | "happy" | "celebrating" | "sleepy";
}

/**
 * Mochi — a minimal, refined capybara companion.
 * No cartoon overload: soft shapes, gentle breathing.
 */
export function Mochi({ size = 44, mood = "calm" }: Props) {
  const sleeping = mood === "sleepy";
  return (
    <motion.div
      animate={{
        y: mood === "celebrating" ? [0, -4, 0] : [0, -1.5, 0],
        rotate: mood === "celebrating" ? [-2, 2, -2] : 0,
      }}
      transition={{
        repeat: Infinity,
        duration: mood === "celebrating" ? 1.1 : 4.5,
        ease: "easeInOut",
      }}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 60 52" width={size} height={size}>
        {/* shadow */}
        <ellipse cx="30" cy="48" rx="14" ry="2" fill="currentColor" opacity="0.08" />
        {/* body */}
        <ellipse cx="30" cy="34" rx="20" ry="13" fill="oklch(0.62 0.04 60)" />
        {/* head */}
        <ellipse cx="30" cy="22" rx="13.5" ry="11" fill="oklch(0.68 0.04 60)" />
        {/* ears */}
        <ellipse cx="20" cy="14" rx="2.6" ry="2" fill="oklch(0.5 0.04 60)" />
        <ellipse cx="40" cy="14" rx="2.6" ry="2" fill="oklch(0.5 0.04 60)" />
        {/* snout */}
        <ellipse cx="30" cy="27" rx="5" ry="3.2" fill="oklch(0.78 0.025 60)" />
        <ellipse cx="30" cy="26.2" rx="0.9" ry="0.6" fill="oklch(0.25 0.04 50)" />
        {/* eyes */}
        {sleeping ? (
          <>
            <path
              d="M23 22 Q25 23.2 27 22"
              stroke="oklch(0.22 0.04 50)"
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M33 22 Q35 23.2 37 22"
              stroke="oklch(0.22 0.04 50)"
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
            />
            <text x="44" y="14" fontSize="6" fill="oklch(0.5 0.02 260)" fontFamily="serif">
              z
            </text>
          </>
        ) : (
          <>
            <circle cx="25" cy="22" r="1.1" fill="oklch(0.18 0.04 50)" />
            <circle cx="35" cy="22" r="1.1" fill="oklch(0.18 0.04 50)" />
          </>
        )}
      </svg>
    </motion.div>
  );
}
