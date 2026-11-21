/* Charte Orea — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        cream: '#F4EFE6',
        sand: '#E8DFD0',
        ink: '#1F1D19',
        bronze: { DEFAULT: '#9C7A4D', light: '#C7A777' },
        sage: '#7F8C74',
        stone: '#7A7266',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1360px' },
    },
  },
};
