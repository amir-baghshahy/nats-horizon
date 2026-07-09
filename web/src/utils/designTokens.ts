/**
 * Design Token Utilities
 * Helper functions for applying design tokens consistently
 */

import {
  SPACING,
  GAP,
  PADDING,
  MARGIN,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  RADIUS,
  ICON,
  BUTTON,
  CARD,
  BADGE,
  INPUT,
  TRANSITION,
  Z_INDEX,
  type ButtonSize,
  type InputSize,
  type IconSizeValue,
} from "../constants/designSystem";

import { cn } from "../utils/cn";

export { cn };

/**
 * Get spacing class
 */
export function spacing(value: keyof typeof SPACING) {
  return SPACING[value];
}

/**
 * Get gap class
 */
export function gap(value: keyof typeof GAP) {
  return GAP[value];
}

/**
 * Get padding preset
 */
export function padding(value: keyof typeof PADDING) {
  return PADDING[value];
}

/**
 * Get margin preset
 */
export function margin(value: keyof typeof MARGIN) {
  return MARGIN[value];
}

/**
 * Get font size class
 */
export function fontSize(value: keyof typeof FONT_SIZE) {
  return FONT_SIZE[value];
}

/**
 * Get font weight class
 */
export function fontWeight(value: keyof typeof FONT_WEIGHT) {
  return FONT_WEIGHT[value];
}

/**
 * Get line height class
 */
export function lineHeight(value: keyof typeof LINE_HEIGHT) {
  return LINE_HEIGHT[value];
}

/**
 * Get border radius class
 */
export function radius(value: keyof typeof RADIUS) {
  return RADIUS[value];
}

/**
 * Get icon size class
 */
export function iconSize(value: IconSizeValue) {
  return ICON[value];
}

/**
 * Get button classes by size
 */
export function buttonSize(size: ButtonSize = "md") {
  const sizeConfig = BUTTON.size[size];
  return cn(
    sizeConfig.base,
    "inline-flex items-center justify-center gap-2 font-semibold",
    "transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    BUTTON.radius,
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary focus:ring-primary-500",
  );
}

/**
 * Get button variant classes
 */
export function buttonVariant(
  variant: "primary" | "secondary" | "danger" | "ghost",
) {
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-500 shadow-sm",
    secondary:
      "bg-surface-secondary text-content-primary border border-border-default hover:bg-surface-tertiary",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm",
    ghost: "bg-transparent text-content-primary hover:bg-surface-tertiary",
  };
  return variants[variant];
}

/**
 * Get input classes by size
 */
export function inputSize(size: InputSize = "md") {
  return cn(
    INPUT.size[size],
    "w-full border border-border-default bg-surface-primary text-content-primary",
    "placeholder:text-content-tertiary/70",
    "outline-none backdrop-blur transition-all duration-200",
    "focus:border-border-focus focus:ring-2 focus:ring-interactive-focus focus:bg-surface-primary/80",
    "disabled:cursor-not-allowed disabled:opacity-60",
    INPUT.radius,
  );
}

/**
 * Get card padding class
 */
export function cardPadding(value: keyof typeof CARD.padding = "default") {
  return cn(
    "relative overflow-hidden backdrop-blur-xl",
    "rounded-xl border border-border-default/60 bg-surface-secondary/75 shadow-lg shadow-black/10",
    CARD.padding[value],
  );
}

/**
 * Get badge classes by size
 */
export function badgeSize(size: keyof typeof BADGE.size = "md") {
  return cn(
    BADGE.size[size],
    "inline-flex items-center font-medium",
    BADGE.radius,
  );
}

/**
 * Get focus ring classes
 */
export function focusRing() {
  return "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary focus:ring-primary-500";
}

/**
 * Get transition classes
 */
export function transition(speed: keyof typeof TRANSITION = "base") {
  return `transition-all duration-${TRANSITION[speed]} ease-out`;
}

/**
 * Get z-index class
 */
export function zIndex(value: keyof typeof Z_INDEX) {
  return Z_INDEX[value];
}

/**
 * Common interactive states
 */
export const interactiveStates = cn(
  "cursor-pointer",
  "transition-all duration-200 ease-out",
  "hover:scale-[1.02] active:scale-[0.98]",
);

/**
 * Card hover effect
 */
export function cardHover() {
  return "hover-lift transition-transform duration-200 ease-out";
}

/**
 * Icon button classes
 */
export function iconButton(variant: "default" | "danger" = "default") {
  return cn(
    PADDING.icon,
    RADIUS.lg,
    "transition-all duration-200 ease-out",
    "hover:scale-110 active:scale-95",
    variant === "danger"
      ? "hover:bg-red-500/20 text-red-400"
      : "hover:bg-surface-primary text-content-primary",
  );
}

/**
 * Get text truncation classes
 */
export function truncate(lines: 1 | 2 | 3 = 1) {
  if (lines === 1) return "truncate";
  return {
    2: "line-clamp-2",
    3: "line-clamp-3",
  }[lines];
}

/**
 * Standard page layout classes
 */
export const pageLayout = cn("p-4 md:p-6", "animate-fade-in");

/**
 * Standard section spacing
 */
export const sectionSpacing = "space-y-6";

/**
 * Grid layout presets
 */
export function gridCols(cols: 1 | 2 | 3 | 4) {
  return {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];
}

/**
 * Responsive container
 */
export const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/**
 * Visually hidden (accessible)
 */
export const visuallyHidden = "sr-only";

/**
 * Focus visible only
 */
export function focusVisible() {
  return "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
}
