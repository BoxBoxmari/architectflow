/**
 * ArchitectFlow Page Transition Animations
 * Framer Motion variants for route transitions — content only (header/sidebar excluded)
 */

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
  },
};

export const pageTransition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/** Reduced-motion fallback — opacity only, no transform */
export const reducedPageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const reducedPageTransition = {
  duration: 0.18,
  ease: 'easeOut',
};
