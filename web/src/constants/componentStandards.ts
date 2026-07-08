/**
 * Component Standards & Patterns
 * Standardized patterns for consistent component implementation
 */

import { cn } from '../utils/designTokens';
import { INPUT, ICON, PADDING, RADIUS, FONT_SIZE, FONT_WEIGHT, GAP, Z_INDEX } from './designSystem';

// ============================================
// PAGE STRUCTURE STANDARDS
// ============================================

export const PAGE_STRUCTURE = {
  // Main page wrapper
  wrapper: cn(
    'p-4 md:p-6',      // Responsive padding
    'animate-fade-in',  // Entry animation
    'space-y-6',        // Consistent section spacing
  ),

  // Page header section
  headerSection: 'mb-6',

  // Content sections
  section: 'space-y-4',

  // Stats section
  statsSection: 'mb-6 animate-slide-up',

  // Divider between sections
  divider: 'h-px bg-gradient-to-r from-transparent via-dark-border/50 to-transparent mb-6',
} as const;

// ============================================
// CARD STANDARDS
// ============================================

export const CARD_STYLES = {
  // Base card
  base: cn(
    'card',              // Uses .card CSS class
    'hover-lift',        // Subtle hover effect
  ),

  // Compact card (for dense lists)
  compact: 'card p-3',

  // Interactive card (clickable)
  interactive: cn(
    'card',
    'cursor-pointer',
    'hover:border-primary-500/50',
    'transition-colors duration-200',
  ),

  // Stat card
  stat: cn(
    'card',
    'border-l-4',        // Left accent border
  ),

  // Panel card (with header/footer)
  panel: 'card overflow-hidden',
} as const;

// ============================================
// BUTTON STANDARDS
// ============================================

export const BUTTON_STANDARDS = {
  // Base structure
  base: cn(
    'inline-flex items-center justify-center',
    'font-semibold',
    'transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    RADIUS.lg,
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary',
  ),

  // Sizes
  sizes: {
    sm: cn('px-3 py-1.5 text-display-sm', 'gap-1.5', ICON.sm),
    md: cn('px-4 py-2 text-display-sm', 'gap-2', ICON.base),
    lg: cn('px-5 py-2.5 text-display-base', 'gap-2', ICON.md),
  },

  // Variants
  variants: {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-sm focus:ring-primary-500',
    secondary: 'bg-surface-secondary text-content-primary border border-border-default hover:bg-surface-tertiary focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-sm focus:ring-red-500',
    ghost: 'bg-transparent text-content-primary hover:bg-surface-tertiary focus:ring-primary-500',
  },

  // Icon only button
  iconOnly: cn(
    PADDING.icon,
    'hover:scale-110 active:scale-95',
    'transition-transform duration-200',
  ),

  // Loading state
  loading: 'opacity-70 pointer-events-none',
} as const;

// ============================================
// INPUT STANDARDS
// ============================================

export const INPUT_STANDARDS = {
  // Base input
  base: cn(
    'w-full',
    INPUT.radius,
    'border border-border-default/70',
    'bg-surface-primary/55',
    FONT_SIZE['display-sm'],
    'text-content-primary',
    'shadow-sm',
    'outline-none',
    'backdrop-blur',
    'transition-all duration-200',
    'placeholder:text-content-tertiary/70',
    // Focus states
    'focus:border-border-focus',
    'focus:ring-2 focus:ring-interactive-focus',
    'focus:bg-surface-primary/80',
    // Disabled state
    'disabled:cursor-not-allowed disabled:opacity-60',
  ),

  // Sizes
  sizes: {
    sm: 'px-2.5 py-2 text-display-xs',
    md: 'px-3 py-2.5 text-display-sm',
    lg: 'px-4 py-3 text-display-base',
  },

  // Variants
  variants: {
    default: '',
    search: 'pl-10', // Space for search icon
  },

  // Textarea
  textarea: cn(
    'min-h-[100px]',
    'resize-y',
  ),
} as const;

// ============================================
// SELECT STANDARDS
// ============================================

export const SELECT_STANDARDS = {
  // Base select
  base: cn(
    INPUT_STANDARDS.base,
    'cursor-pointer',
  ),

  // Dropdown
  dropdown: cn(
    'max-h-60 overflow-auto rounded-xl',
    'border border-dark-border/70',
    'bg-dark-card/95',
    'shadow-xl',
    'backdrop-blur-sm',
    'scrollbar-thin',
    Z_INDEX.popover,
  ),

  // Option
  option: cn(
    'w-full',
    'text-start',
    'transition-colors',
  ),
} as const;

// ============================================
// BADGE STANDARDS
// ============================================

export const BADGE_STANDARDS = {
  // Base badge
  base: cn(
    'inline-flex items-center',
    FONT_WEIGHT.medium,
    RADIUS.full,
  ),

  // Sizes
  sizes: {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
  },

  // Variants
  variants: {
    default: 'bg-dark-border/50 text-dark-text',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  },
} as const;

// ============================================
// TABLE/LIST STANDARDS
// ============================================

// Base row styles (defined separately to avoid circular reference)
const tableRowBase = cn(
  'border-b border-dark-border/40',
  'transition-colors duration-200',
);

export const TABLE_STANDARDS = {
  // Row
  row: tableRowBase,

  // Interactive row
  rowInteractive: cn(
    tableRowBase,
    'hover:bg-dark-bg/50',
    'cursor-pointer',
  ),

  // Header cell
  headerCell: cn(
    'px-4 py-3',
    FONT_SIZE['display-sm'],
    FONT_WEIGHT.semibold,
    'text-dark-muted',
    'uppercase tracking-wide',
  ),

  // Data cell
  cell: cn(
    'px-4 py-3',
    FONT_SIZE['display-sm'],
    'text-content-primary',
  ),
} as const;

// ============================================
// MODAL STANDARDS
// ============================================

export const MODAL_STANDARDS = {
  // Backdrop
  backdrop: cn(
    'fixed inset-0',
    'bg-black/60',
    'backdrop-blur-sm',
    'animate-fade-in',
    Z_INDEX.modalBackdrop,
  ),

  // Container
  container: cn(
    'relative',
    'w-full max-w-md',
    'animate-scale-in',
    Z_INDEX.modal,
  ),

  // Header
  header: cn(
    'flex items-center justify-between',
    PADDING.card,
    'border-b border-dark-border',
  ),

  // Body
  body: cn(
    'overflow-y-auto',
    PADDING.card,
    'flex-1',
  ),

  // Footer
  footer: cn(
    'flex items-center justify-end',
    GAP.md,
    PADDING.card,
    'border-t border-dark-border',
  ),
} as const;

// ============================================
// TOOLTIP STANDARDS
// ============================================

export const TOOLTIP_STANDARDS = {
  base: cn(
    'px-2.5 py-1',
    'rounded-lg',
    FONT_SIZE['display-xs'],
    'font-medium',
    'bg-dark-text',
    'text-white',
    'shadow-lg',
    'pointer-events-none',
    Z_INDEX.tooltip,
  ),
} as const;

// ============================================
// ICON BUTTON STANDARDS
// ============================================

export const ICON_BUTTON_STANDARDS = {
  // Base
  base: cn(
    PADDING.icon,
    RADIUS.lg,
    'transition-all duration-200',
    'hover:scale-110 active:scale-95',
  ),

  // Variants
  variants: {
    default: 'hover:bg-dark-bg text-dark-text',
    danger: 'hover:bg-red-500/20 text-red-400',
    primary: 'hover:bg-primary-500/20 text-primary-400',
    success: 'hover:bg-green-500/20 text-green-400',
  },
} as const;

// ============================================
// FORM STANDARDS
// ============================================

export const FORM_STANDARDS = {
  // Field wrapper
  fieldWrapper: 'space-y-1.5',

  // Label
  label: cn(
    'block',
    FONT_SIZE['display-sm'],
    FONT_WEIGHT.medium,
    'text-content-primary',
  ),

  // Required indicator
  required: 'text-red-400',

  // Error message
  error: cn(
    FONT_SIZE['display-xs'],
    'text-red-400',
    'mt-1',
  ),

  // Help text
  help: cn(
    FONT_SIZE['display-xs'],
    'text-dark-muted',
    'mt-1',
  ),
} as const;

// ============================================
// FILTER BAR STANDARDS
// ============================================

export const FILTER_BAR_STANDARDS = {
  // Container
  container: cn(
    'card',
    'mb-4',
  ),

  // Search wrapper
  searchWrapper: 'relative flex-1',

  // Search icon
  searchIcon: cn(
    'absolute left-3 top-1/2 -translate-y-1/2',
    ICON.base,
    'text-dark-muted',
  ),

  // Clear button
  clearButton: cn(
    'absolute right-3 top-1/2 -translate-y-1/2',
    ICON.sm,
    'text-dark-muted hover:text-dark-text',
  ),

  // Badges row
  badgesRow: cn(
    'flex flex-wrap items-center',
    GAP.md,
    'pt-3 border-t border-dark-border/60',
  ),

  // Badge
  badge: cn(
    'inline-flex items-center',
    GAP.sm,
    'px-2.5 py-1 rounded-full',
    'bg-primary-500/15',
    FONT_SIZE['display-xs'],
    'text-primary-300',
  ),
} as const;

// ============================================
// LOADING STATES
// ============================================

export const LOADING_STANDARDS = {
  // Spinner sizes
  spinner: {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  },

  // Spinner base
  spinnerBase: cn(
    'rounded-full',
    'border-dark-border',
    'border-t-primary-500',
    'animate-spin',
  ),

  // Skeleton
  skeleton: cn(
    'animate-pulse',
    'bg-dark-border/50',
    'rounded',
  ),

  // Loading container
  container: cn(
    'flex items-center justify-center',
    'min-h-[400px]',
    'p-8',
  ),
} as const;

// ============================================
// EMPTY STATE STANDARDS
// ============================================

export const EMPTY_STATE_STANDARDS = {
  // Sizes
  sizes: {
    small: { padding: 'p-8', icon: ICON.avatar },
    normal: { padding: 'p-12', icon: ICON.lg },
    large: { padding: 'p-16', icon: ICON.hero },
  },

  // Icon wrapper
  iconWrapper: cn(
    'mx-auto mb-4 flex items-center justify-center',
    'rounded-2xl bg-surface-primary/50',
    'text-content-tertiary',
  ),

  // Title
  title: cn(
    'font-semibold',
    'text-content-primary',
  ),

  // Description
  description: cn(
    'mt-2 leading-6',
    FONT_SIZE['display-sm'],
    'text-content-secondary',
  ),
} as const;

// ============================================
// STATUS INDICATOR STANDARDS
// ============================================

export const STATUS_STANDARDS = {
  // Dot sizes
  dot: {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  },

  // Status colors
  colors: {
    online: 'bg-green-400',
    offline: 'bg-dark-muted',
    busy: 'bg-red-400',
    away: 'bg-yellow-400',
  },

  // Base dot
  dotBase: cn('rounded-full'),
} as const;

// ============================================
// TRANSITION STANDARDS
// ============================================

export const TRANSITION_STANDARDS = {
  // Standard transition
  base: 'transition-all duration-200 ease-out',

  // Color transition
  color: 'transition-colors duration-200',

  // Transform transition
  transform: 'transition-transform duration-200 ease-out',

  // Slow transition
  slow: 'transition-all duration-300 ease-out',
} as const;
