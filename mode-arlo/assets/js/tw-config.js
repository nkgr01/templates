/* Charte Arlo — couleurs et polices (à adapter pour chaque client) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ecru: '#F2EFE9',
        sand: '#E4DED3',
        ink: '#151515',
        terra: { DEFAULT: '#B4532A', light: '#D9825C' },
        olive: '#5E5E45',
        stone: '#77726A',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1440px' },
    },
  },
};
