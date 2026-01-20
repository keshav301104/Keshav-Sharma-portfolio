import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. Define the Animation Utilities
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'scan': 'scan 2s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      // 2. Define the Keyframe Logic
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'scan': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
    },
  },
  plugins: [],
};
export default config;