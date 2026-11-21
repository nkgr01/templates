/* Charte Kinetik — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0C',
        card: '#151517',
        line: 'rgba(255,255,255,.09)',
        bone: '#F4F4EF',
        muted: '#8C8C86',
        lime: '#D2FF3A',
        violet: '#9B87FF',
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1320px' },
      letterSpacing: { tightest: '-.055em' },
    },
  },
};
