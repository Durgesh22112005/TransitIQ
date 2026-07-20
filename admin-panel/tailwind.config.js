/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF',
          900: '#1E3A8A',
        },
        success:  { 50: '#ECFDF5', 500: '#10B981', 700: '#059669' },
        warning:  { 50: '#FFFBEB', 500: '#F59E0B', 700: '#D97706' },
        danger:   { 50: '#FEF2F2', 500: '#EF4444', 700: '#DC2626' },
      },
      borderRadius: { DEFAULT: '16px' },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 4px 20px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
};
