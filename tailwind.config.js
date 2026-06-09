import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:    'var(--color-brand-primary)',
          'primary-bg': 'var(--color-brand-primary-bg)',
        },
        bg: {
          base:    'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          card:    'var(--color-bg-card)',
          dark:    'var(--color-bg-dark)',
        },
        text: {
          main:      'var(--color-text-main)',
          secondary: 'var(--color-text-secondary)',
          disabled:  'var(--color-text-disabled)',
        },
        border: {
          default: 'var(--color-border-default)',
          strong:  'var(--color-border-strong)',
        },
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
    },
  },
  plugins: [typography],
};
