import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Debt type colors
        mortgage: {
          DEFAULT: 'rgb(var(--mortgage))',
          light: 'rgb(var(--mortgage) / 0.1)',
          medium: 'rgb(var(--mortgage) / 0.2)',
        },
        auto: {
          DEFAULT: 'rgb(var(--auto))',
          light: 'rgb(var(--auto) / 0.1)',
          medium: 'rgb(var(--auto) / 0.2)',
        },
        utility: {
          DEFAULT: 'rgb(var(--utility))',
          light: 'rgb(var(--utility) / 0.1)',
          medium: 'rgb(var(--utility) / 0.2)',
        },
        creditCard: {
          DEFAULT: 'rgb(var(--credit-card))',
          light: 'rgb(var(--credit-card) / 0.1)',
          medium: 'rgb(var(--credit-card) / 0.2)',
        },
        studentLoan: {
          DEFAULT: 'rgb(var(--student-loan))',
          light: 'rgb(var(--student-loan) / 0.1)',
          medium: 'rgb(var(--student-loan) / 0.2)',
        },
        personalLoan: {
          DEFAULT: 'rgb(var(--personal-loan))',
          light: 'rgb(var(--personal-loan) / 0.1)',
          medium: 'rgb(var(--personal-loan) / 0.2)',
        },
        medical: {
          DEFAULT: 'rgb(var(--medical))',
          light: 'rgb(var(--medical) / 0.1)',
          medium: 'rgb(var(--medical) / 0.2)',
        },
        telecom: {
          DEFAULT: 'rgb(var(--telecom))',
          light: 'rgb(var(--telecom) / 0.1)',
          medium: 'rgb(var(--telecom) / 0.2)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(var(--primary), 0.4)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(var(--primary), 0.2)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
