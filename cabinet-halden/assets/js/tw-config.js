tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0D0F13', 900: '#0D0F13', 800: '#14171D', 700: '#1C2028', 600: '#2A2F39' },
        ivory: { DEFAULT: '#F3EEE4', 200: '#E6DFD2', 400: '#B9B2A5' },
        gold: { DEFAULT: '#C8A96A', 300: '#E2CC98', 500: '#C8A96A', 700: '#8E7442' },
        mute: '#8A8F98',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { widest2: '.32em' },
      maxWidth: { site: '1320px' },
    },
  },
};
