export const MOTION_TRANSITION = {
  duration: 0.2, // Emil Kowalski: 150-250ms, never > 300ms
  ease: [0.23, 1, 0.32, 1], // Emil Kowalski cubic-bezier
};

export const MOTION_VARIANTS = {
  // Enter/Exit: Never scale(0), start at scale(0.95) + opacity: 0
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: MOTION_TRANSITION,
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: MOTION_TRANSITION,
  },
  slideDown: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: MOTION_TRANSITION,
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.04, // 30-50ms stagger
      },
    },
  },
};

