/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    main: '#128C7E',
                    light: '#25D366',
                    dark: '#075E54',
                },
                secondary: {
                    main: '#34B7F1',
                    light: '#4AC959',
                    dark: '#0A66C2',
                },
                background: {
                    primary: '#FFFFFF',
                    secondary: '#F0F2F5',
                    dark: '#111B21',
                }
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'tab-slide': 'tab-slide 0.3s ease-out forwards',
                'blob': 'blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1)',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(79, 70, 229, 0.4))' },
                    '50%': { filter: 'drop-shadow(0 0 20px rgba(79, 70, 229, 0.7))' },
                },
                'tab-slide': {
                    from: { transform: 'scaleX(0)' },
                    to: { transform: 'scaleX(1)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.2)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.8)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
