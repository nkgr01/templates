tailwind.config = {
  theme: {
    extend: {
      colors: {
        void: { DEFAULT: '#07070B', 900: '#07070B', 800: '#0E0E15', 700: '#15151F', 600: '#1F1F2C' },
        violet: { DEFAULT: '#7C5CFF', 300: '#B3A1FF', 500: '#7C5CFF', 700: '#5136D9' },
        cyan: { DEFAULT: '#22D3EE', 300: '#7DE8F7' },
        rose: { DEFAULT: '#F472B6' },
        fog: '#9A9AB0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '1240px' },
    },
  },
};
