/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FFFFFF",
        muted: "#6B7280",
        faint: "#9CA3AF",
        surface: "#FAFAFA",
        border: "#EEF0F3",
        "accent-start": "#1E3A8A",
        "accent-end": "#3B82F6",
        danger: "#EF4444",
        success: "#10B981",
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: "16px",
        pill: "24px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.05)",
        cardHover: "0 12px 32px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
}
