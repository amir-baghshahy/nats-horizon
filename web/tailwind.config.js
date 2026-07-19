/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Vazirmatn",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.125rem" }],
        base: ["0.875rem", { lineHeight: "1.25rem" }],
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.125rem", { lineHeight: "1.625rem" }],
        "2xl": ["1.375rem", { lineHeight: "1.75rem" }],
        "3xl": ["1.625rem", { lineHeight: "2rem" }],
      },
      colors: {
        // Inspired by Grafana/Linear/Redpanda Console
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },

        // Legacy dark theme colors (kept for backward compatibility)
        dark: {
          bg: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          text: "#f1f5f9",
          muted: "#94a3b8",
        },

        // Status colors
        status: {
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },

        // Semantic surface colors (backgrounds)
        surface: {
          primary: "#0f172a", // Main background
          secondary: "#1e293b", // Cards, panels
          tertiary: "#334155", // Nested elements
          elevated: "#1e293b", // Elevated surfaces (modals, dropdowns)
          overlay: "rgba(15, 23, 42, 0.8)", // Backdrop overlays
        },

        // Semantic content colors (text)
        content: {
          primary: "#f1f5f9", // Main text, headings
          secondary: "#cbd5e1", // Secondary text, descriptions
          tertiary: "#94a3b8", // Muted text, labels
          disabled: "#64748b", // Disabled text
          inverse: "#0f172a", // Text on colored backgrounds
        },

        // Semantic border colors
        border: {
          default: "#334155", // Default borders
          subtle: "#1e293b", // Subtle borders
          strong: "#475569", // Strong borders
          focus: "#0ea5e9", // Focus rings
          interactive: "#0ea5e9", // Interactive elements
        },

        // Interactive state colors
        interactive: {
          hover: "rgba(14, 165, 233, 0.1)", // Hover background
          active: "rgba(14, 165, 233, 0.15)", // Active background
          focus: "rgba(14, 165, 233, 0.2)", // Focus background
          disabled: "rgba(100, 116, 139, 0.5)", // Disabled state
          highlight: "rgba(56, 189, 248, 0.3)", // Selection highlight
        },

        // Glow effects (for status indicators, active states)
        glow: {
          success: "rgba(34, 197, 94, 0.28)",
          warning: "rgba(245, 158, 11, 0.28)",
          error: "rgba(239, 68, 68, 0.28)",
          info: "rgba(56, 189, 248, 0.28)",
          primary: "rgba(14, 165, 233, 0.28)",
        },
      },
    },
  },
  plugins: [],
};
