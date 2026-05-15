import type { Transition, Variants } from "motion/react"

// ── Easing curves ──────────────────────────────────────────────────────
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_SNAPPY_OUT = [0.19, 1, 0.22, 1] as const

// ── Springs ────────────────────────────────────────────────────────────
export const SPRING_SMOOTH = {
  type: "spring",
  duration: 0.45,
  bounce: 0,
} as Transition

export const SPRING_GENTLE = {
  type: "spring",
  duration: 0.55,
  bounce: 0,
} as Transition

export const SPRING_BOUNCE = {
  type: "spring",
  duration: 0.6,
  bounce: 0.45,
} as Transition

export const SPRING_SNAPPY = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as Transition

export const SPRING_SLIDE = {
  type: "spring",
  stiffness: 200,
  damping: 30,
  mass: 1,
} as Transition

export const SPRING_CONTENT = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 1,
} as Transition

// ── Tween transitions ──────────────────────────────────────────────────
export const TWEEN_DEFAULT = { duration: 0.3, ease: EASE_OUT_CUBIC }
export const TWEEN_FAST = { duration: 0.2, ease: EASE_OUT_QUART }
export const TWEEN_SLOW = { duration: 0.5, ease: EASE_OUT_EXPO }

// ── Layout / height transitions ────────────────────────────────────────
export const LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 250,
  damping: 30,
  mass: 0.8,
} as Transition

// ── Interaction presets (whileTap, whileHover) ─────────────────────────
export const TAP_SCALE = { scale: 0.97 }
export const TAP_SCALE_SM = { scale: 0.985 }
export const HOVER_LIFT = { y: -1 }

// ── Variant presets ────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export const slideInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

// Container with staggered children
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

// Collapse / expand (height auto)
export const collapseVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
}

// Alert / banner entrance
export const alertVariants: Variants = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
}

// ── Legacy aliases (keep old imports working) ──────────────────────────
export const SPRING_SMOOTH_ONE = SPRING_SMOOTH
export const SPRING_BOUNCE_ONE = SPRING_BOUNCE
export const SPRING_SMOOTH_TWO = SPRING_SNAPPY
export const SPRING_SMOOTH_SLIDE = SPRING_SLIDE
export const SPRING_CONTENT_ENTRY = SPRING_CONTENT
export const TRANSITION_DEFAULT = TWEEN_DEFAULT
export const TRANSITION_FAST = TWEEN_FAST
export const TRANSITION_SLOW = TWEEN_SLOW

export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: TWEEN_DEFAULT,
}

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: TWEEN_DEFAULT,
}

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: SPRING_SMOOTH,
}
