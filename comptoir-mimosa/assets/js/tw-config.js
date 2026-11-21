/* Charte Comptoir Mimosa — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        cream: '#FFF6E5',
        ink: '#1B2350',
        mimosa: { DEFAULT: '#FFD449', light: '#FFE78F' },
        cobalt: '#3047D9',
        rose: '#FF9DB8',
        leaf: '#2F8F5B',
        tangerine: '#FF7A45',
        muted: '#5D6388',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { blob: '32px' },
      maxWidth: { site: '1400px' },
    },
  },
};
