/* Charte Lagune Lodge — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        sand: { DEFAULT: '#F6F1E7', 2: '#EDE4D3' },
        lagoon: { DEFAULT: '#0E8C8C', light: '#7FD1CB', pale: '#DDF1EE' },
        abyss: '#0F2F3F',
        coral: '#F28C6B',
        drift: '#5E7480',
      },
      fontFamily: {
        serif: ['Marcellus', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1400px' },
    },
  },
};
