tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F1EFEA', 200: '#E7E4DD', 300: '#D9D5CC' },
        ink: { DEFAULT: '#121212', 700: '#2A2A2A' },
        flame: { DEFAULT: '#FF5B1F', 600: '#E44A10' },
        stone: '#8C877D',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '1440px' },
    },
  },
};
