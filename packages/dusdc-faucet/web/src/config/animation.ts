import type { Transition } from "motion/react";

export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_SNAPPY_OUT = [0.19, 1, 0.22, 1] as const;

export const SPRING_SMOOTH_ONE = {
  type: "spring",
  duration: 0.45,
  bounce: 0,
} as Transition;

export const SPRING_BOUNCE_ONE = {
  type: "spring",
  duration: 0.6,
  bounce: 0.45,
} as Transition;

export const SPRING_SMOOTH_TWO = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as Transition;

export const SPRING_SMOOTH_SLIDE = {
  type: "spring",
  stiffness: 200,
  damping: 30,
  mass: 1,
} as Transition;

export const SPRING_CONTENT_ENTRY = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 1,
} as Transition;

type TransitionName =
  | "SPRING_SMOOTH_ONE"
  | "SPRING_BOUNCE_ONE"
  | "SPRING_SMOOTH_TWO"
  | "SPRING_SMOOTH_SLIDE"
  | "SPRING_CONTENT_ENTRY";

export const getTransitionConfig = (type: TransitionName) => {
  switch (type) {
    case "SPRING_SMOOTH_ONE":
      return SPRING_SMOOTH_ONE;
    case "SPRING_BOUNCE_ONE":
      return SPRING_BOUNCE_ONE;
    case "SPRING_SMOOTH_TWO":
      return SPRING_SMOOTH_TWO;
    case "SPRING_SMOOTH_SLIDE":
      return SPRING_SMOOTH_SLIDE;
    case "SPRING_CONTENT_ENTRY":
      return SPRING_CONTENT_ENTRY;
  }
};

export const TRANSITION_DEFAULT = { duration: 0.3, ease: EASE_OUT_CUBIC }
export const TRANSITION_FAST = { duration: 0.2, ease: EASE_OUT_QUART }
export const TRANSITION_SLOW = { duration: 0.5, ease: EASE_OUT_EXPO }

export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: TRANSITION_DEFAULT,
}

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: TRANSITION_DEFAULT,
}

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: SPRING_SMOOTH_ONE,
}
