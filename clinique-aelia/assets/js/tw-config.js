/* Charte Aelia — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        mist: '#F3F7F6',
        ink: '#0F2A2A',
        teal: { DEFAULT: '#0E7C6B', dark: '#0A5E51' },
        mint: '#D6EFE7',
        sky: '#E4EEF7',
        peach: '#F7D3C1',
        slate: '#5B6E6C',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      maxWidth: { site: '1280px' },
      borderRadius: { '4xl': '2rem', '5xl': '2.75rem' },
      boxShadow: { soft: '0 1px 2px rgba(15,42,42,.04), 0 12px 40px -12px rgba(15,42,42,.12)' },
    },
  },
};
