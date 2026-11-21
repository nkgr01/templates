/* Charte Ébène — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#0E2A22', deep: '#091C17', soft: '#163A2F' },
        cream: '#F2E8D5',
        ochre: { DEFAULT: '#D99A3D', light: '#EDC27A' },
        terra: '#C2603A',
        sage: '#8FAE95',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1380px' },
    },
  },
};
