/* Charte JMK Consulting Company — bleu et ocre du logo, modernisés */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0E1B3D', 2: '#1C2B57', 3: '#2B3C6E' },
        ocre: { DEFAULT: '#C8862E', light: '#E9B567', pale: '#F6E7CF' },
        cream: { DEFAULT: '#F6F2EA', 2: '#ECE4D6' },
        leaf: { DEFAULT: '#2F6B45', pale: '#E2EDE0' },
        mute: '#5F6780',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1360px' },
    },
  },
};
