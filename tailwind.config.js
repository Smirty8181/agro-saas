export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F5F1E8',
        cream: '#E8DDCB',
        taupe: '#DCCCB3',
        bronze: '#B89B72',
        earth: '#8B6F47',
        oak: '#5F4A2F',
        field: '#F8F5EE',
        glaze: 'rgba(255,255,255,0.72)'
      },
      boxShadow: {
        soft: '0 24px 80px rgba(42, 33, 22, 0.12)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.7)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'field-gradient': 'radial-gradient(circle at top left, rgba(229, 209, 177, 0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(143, 124, 87, 0.18), transparent 26%)'
      }
    }
  },
  plugins: []
}
