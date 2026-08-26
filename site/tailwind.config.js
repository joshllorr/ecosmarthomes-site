/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{html,js}",
    "./tools/**/*.{html,js}",
    "./guides/**/*.{html,js}",
    "./support/**/*.{html,js}",
    "./checkout/**/*.{html,js}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Elite visual identity bypassing the generic "Indigo-to-Violet" AI Slop
        brand: {
          // Deep Slate representing security, authority, and the "Carbon Tax Shield"
          navy: {
            950: '#020617', // Main background for height-locked viewports
            900: '#0f172a', // Card backgrounds, structured sections
            800: '#1e293b', // Hover states, borders
          },
          // Rich Irish Emerald representing environmental compliance and SEAI grant viability
          emerald: {
            300: '#6ee7b7', // Vibrant text highlights, badge outlines
            500: '#10b981', // Primary interactive buttons, successful validation states
            600: '#059669', // Deep hover button states
            700: '#047857', // Accent borders
          },
          // Warm gold/amber representing financial savings, thermal energy, and direct ROI
          accent: {
            300: '#fde047', // Warning highlights, soft badges
            500: '#eab308', // Monetary values, slider text, rating leaps
            600: '#ca8a04', // Secondary CTAs
          },
        },
      },
      // Unique visual craftsmanship to escape uniform defaults
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Professional sans-serif for optimal readability
        serif: ['Liberation Serif', 'Georgia', 'serif'], // Sophisticated serif for high-converting headers
      },
      borderRadius: {
        'xl': '12px',  // Customized border radii to replace the overused "uniform rounded-lg" slop
        '2xl': '16px',
        '3xl': '24px',
      },
      // Customized keyframes specifically for the Aoife Voice AI and scanner animations
      keyframes: {
        'waveform-pulse': {
          '0%, 100%': { transform: 'scaleY(0.3)', opacity: '0.4' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      animation: {
        'voice-pulse-slow': 'waveform-pulse 1.2s ease-in-out infinite',
        'voice-pulse-medium': 'waveform-pulse 0.8s ease-in-out infinite',
        'voice-pulse-fast': 'waveform-pulse 0.5s ease-in-out infinite',
        'scanner-sweep': 'scan-line 3s linear infinite',
      },
    },
  },
  plugins: [],
}
