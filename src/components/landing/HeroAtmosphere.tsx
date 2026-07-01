import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Mochi } from "@/components/Mochi";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroMochi() {
  return (
    <motion.div
      className="mx-auto mb-8 flex justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mochi size={64} mood="calm" />
      </motion.div>
    </motion.div>
  );
}

/** Scroll hint — links to the product section below */
export function HeroScrollCue() {
  return (
    <motion.a
      href="#product"
      className="mx-auto mt-14 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.5 }}
    >
      <span>See inside</span>
      <motion.span
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ChevronDown className="h-4 w-4 opacity-60" />
      </motion.span>
    </motion.a>
  );
}
