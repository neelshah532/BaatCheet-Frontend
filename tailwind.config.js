/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            width: {
                'container-fluid': '100%',
            },
            maxWidth: {
                container: '1268px',
            },
            animation: {
                bounce: 'bounce 1s infinite',
            },
            keyframes: {
                bounce: {
                    '0%, 100%': { transform: 'translateY(-25%)' },
                    '50%': { transform: 'translateY(0)' },
                }
            }

        },
    },
    plugins: [],
}
