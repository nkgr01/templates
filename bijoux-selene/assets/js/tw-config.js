/* Charte Sélène — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        night: '#12100E',
        coal: '#1C1916',
        smoke: '#2A2622',
        pearl: '#F3EBDD',
        gold: { DEFAULT: '#CFAE7A', light: '#E6CFA4' },
        mist: '#9A9084',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1380px' },
    },
  },
};
