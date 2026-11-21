/* Charte Pulse Club — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        coal: { DEFAULT: '#0A0A0A', 2: '#141414', 3: '#1E1E1E' },
        blaze: { DEFAULT: '#FF3B2F', dark: '#D92A20' },
        volt: '#E8FF3A',
        ash: '#A3A3A3',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1440px' },
    },
  },
};
