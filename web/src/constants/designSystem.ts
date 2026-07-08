/**
 * Design System Tokens
 * Centralized design tokens for consistent UI across the application
 */

// ============================================
// SPACING SCALE (Base unit: 4px)
// ============================================
export const SPACING = {
  // Micro spacing (2px, 4px, 6px, 8px)
  xxxs: '0.125rem',   // 2px   - microscopic gaps
  xxs: '0.25rem',     // 4px   - icon spacing, tight gaps
  xs: '0.375rem',     // 6px   - compact spacing
  sm: '0.5rem',       // 8px   - small gaps, icon padding

  // Standard spacing (12px, 16px, 20px, 24px)
  md: '0.75rem',      // 12px  - card padding (compact)
  base: '1rem',       // 16px  - base unit, standard gaps
  lg: '1.25rem',      // 20px  - comfortable spacing
  xl: '1.5rem',       // 24px  - section gaps, large padding

  // Large spacing (32px, 40px, 48px)
  '2xl': '2rem',      // 32px  - major sections
  '3xl': '2.5rem',    // 40px  - page-level spacing
  '4xl': '3rem',      // 48px  - extra large gaps
} as const;

// Pre-defined gap values for common use cases
export const GAP = {
  none: 'gap-0',
  xxs: 'gap-[0.125rem]',   // 2px   - microscopic
  xs: 'gap-[0.25rem]',     // 4px   - icon groups
  sm: 'gap-[0.5rem]',      // 8px   - related items
  md: 'gap-[0.75rem]',     // 12px  - form fields
  base: 'gap-1',           // 16px  - standard
  lg: 'gap-1.5',           // 24px  - sections
  xl: 'gap-2',             // 32px  - major sections
} as const;

// Padding presets
export const PADDING = {
  // Icon buttons
  icon: 'p-1.5',           // 6px   - icon buttons
  iconSm: 'p-1',           // 4px   - small icons

  // Cards
  card: 'p-4',            // 16px  - standard cards
  cardCompact: 'p-3',      // 12px  - compact cards
  cardSpacious: 'p-6',    // 24px  - large cards

  // Form elements
  input: 'px-3 py-2.5',    // 12px h, 10px v
  inputSm: 'px-2.5 py-2',  // 10px h, 8px v
  select: 'px-3 py-2.5',   // 12px h, 10px v

  // Buttons
  btn: 'px-4 py-2',       // 16px h, 8px v
  btnSm: 'px-3 py-1.5',   // 12px h, 6px v
  btnLg: 'px-5 py-2.5',   // 20px h, 10px v

  // Page container
  page: 'p-4 md:p-6',      // 16px / 24px responsive
} as const;

// Margin presets
export const MARGIN = {
  section: 'mb-6',         // 24px  - between sections
  card: 'mb-4',            // 16px  - between cards
  item: 'mb-3',            // 12px  - between items
  sm: 'mb-2',              // 8px   - small gaps
} as const;

// ============================================
// TYPOGRAPHY SCALE
// ============================================
export const FONT_SIZE = {
  // Display sizes
  'display-xs': 'text-xs',     // 12px - metadata, tags
  'display-sm': 'text-sm',     // 14px - secondary text
  'display-base': 'text-base', // 16px - body text
  'display-lg': 'text-lg',     // 18px - emphasized
  'display-xl': 'text-xl',     // 20px - subheadings
  'display-2xl': 'text-2xl',   // 24px - headings
  'display-3xl': 'text-3xl',   // 30px - page titles
} as const;

export const FONT_WEIGHT = {
  normal: 'font-normal',   // 400 - body text
  medium: 'font-medium',   // 500 - emphasized
  semibold: 'font-semibold', // 600 - headings
  bold: 'font-bold',       // 700 - strong emphasis
} as const;

export const LINE_HEIGHT = {
  tight: 'leading-tight',    // 1.25 - headings
  normal: 'leading-normal', // 1.5 - body text
  relaxed: 'leading-relaxed', // 1.625 - readable text
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',         // 2px  - subtle
  base: 'rounded',          // 4px  - default
  md: 'rounded-md',         // 6px  - cards
  lg: 'rounded-lg',         // 8px  - buttons, inputs
  xl: 'rounded-xl',         // 12px - large cards
  '2xl': 'rounded-2xl',     // 16px - panels
  full: 'rounded-full',     // 50% - pills, badges
} as const;

// ============================================
// ICON SIZING
// ============================================
export const ICON = {
  // Standard icon sizes
  xs: 'w-3 h-3',       // 12px - tiny icons
  sm: 'w-3.5 h-3.5',   // 14px - small icons
  base: 'w-4 h-4',     // 16px - default icons
  md: 'w-5 h-5',       // 20px - medium icons
  lg: 'w-6 h-6',       // 24px - large icons

  // Special cases
  avatar: 'w-8 h-8',   // 32px - avatars
  avatarLg: 'w-12 h-12', // 48px - large avatars
  hero: 'w-16 h-16',    // 64px - hero icons
} as const;

// ============================================
// OPACITY LEVELS (for colors)
// ============================================
export const OPACITY = {
  invisible: '0',
  faint: '5',
  subtle: '10',
  soft: '15',
  medium: '20',
  strong: '30',
  heavy: '40',
  prominent: '50',
  dominant: '60',
  solid: '100',
} as const;

// ============================================
// SHADOWS
// ============================================
export const SHADOW = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  glow: 'shadow-lg shadow-current',
} as const;

// ============================================
// TRANSITIONS
// ============================================
export const TRANSITION = {
  fast: 'duration-150',
  base: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',

  easing: {
    out: 'ease-out',
    in: 'ease-in',
    inOut: 'ease-in-out',
  },
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const Z_INDEX = {
  base: 'z-0',
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modalBackdrop: 'z-40',
  modal: 'z-50',
  popover: 'z-50',
  tooltip: 'z-[60]',
} as const;

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

// Button presets
export const BUTTON = {
  size: {
    sm: {
      base: 'px-3 py-1.5 text-sm',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      base: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      base: 'px-5 py-2.5 text-base',
      icon: 'w-5 h-5',
    },
  },
  radius: RADIUS.lg,
} as const;

// Card presets
export const CARD = {
  padding: {
    compact: 'p-3',
    default: 'p-4',
    spacious: 'p-6',
  },
  radius: RADIUS.xl,
} as const;

// Badge presets
export const BADGE = {
  size: {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
  },
  radius: RADIUS.full,
} as const;

// Input presets
export const INPUT = {
  size: {
    sm: 'px-2.5 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  },
  radius: RADIUS.lg,
} as const;

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================
export const BREAKPOINT = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
} as const;

// ============================================
// LAYOUT GRID
// ============================================
export const GRID = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  cols: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },
} as const;

// ============================================
// ACCESSIBILITY
// ============================================
export const A11Y = {
  // Minimum touch target size (WCAG 2.1 AAA)
  minTouchTarget: 'min-w-[44px] min-h-[44px]',

  // Focus states
  focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary focus:ring-primary-500',

  // Skip link
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white',
} as const;

// ============================================
// ANIMATION DURATIONS
// ============================================
export const ANIMATION = {
  instant: '100ms',
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Type aliases for convenience
export type SpacingValue = keyof typeof SPACING;
export type GapValue = keyof typeof GAP;
export type FontSizeValue = keyof typeof FONT_SIZE;
export type FontWeightValue = keyof typeof FONT_WEIGHT;
export type RadiusValue = keyof typeof RADIUS;
export type IconSizeValue = keyof typeof ICON;
export type ButtonSize = keyof typeof BUTTON.size;
export type InputSize = keyof typeof INPUT.size;
