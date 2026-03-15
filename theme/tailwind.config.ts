import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // BSS raw palette — prefer semantic tokens above
        bss: {
          bg:       '#1a1510',
          surface:  '#231c14',
          surface2: '#2c2418',
          border:   '#3a3020',
          dim:      '#7a6a58',
          muted:    '#907e68',
          text:     '#e8dfd0',
          gold: { dark: '#c98d1a', light: '#8a6010' },
          rust: { dark: '#cc6030', light: '#a83e18' },
          teal: { dark: '#5a9e80', light: '#2a6a4c' },
          parchment: '#f2ede4',
          linen:     '#e8e1d6',
        },
      },
      borderRadius: {
        none:  '0px',
        sm:    '2px',
        md:    'var(--radius)',  /* 4px */
        lg:    'var(--radius)',  /* capped at 4px */
        xl:    'var(--radius)',
        '2xl': 'var(--radius)',
        full:  '9999px',        /* pills only */
      },
      fontFamily: {
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-barlow)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-martian-mono)', 'Courier New', 'monospace'],
        sans:    ['var(--font-barlow)',    'system-ui', 'sans-serif'],
      },
      fontSize: {
        '9':  ['0.5625rem', { lineHeight: '1.4' }],
        '10': ['0.625rem',  { lineHeight: '1.4' }],
        '11': ['0.6875rem', { lineHeight: '1.4' }],
        '12': ['0.75rem',   { lineHeight: '1.5' }],
        '13': ['0.8125rem', { lineHeight: '1.5' }],
        '14': ['0.875rem',  { lineHeight: '1.55' }],
        '15': ['0.9375rem', { lineHeight: '1.6' }],
        '16': ['1rem',      { lineHeight: '1.6' }],
        '17': ['1.0625rem', { lineHeight: '1.5' }],
        '18': ['1.125rem',  { lineHeight: '1.4' }],
        '20': ['1.25rem',   { lineHeight: '1.35' }],
        '22': ['1.375rem',  { lineHeight: '1.3' }],
        '26': ['1.625rem',  { lineHeight: '1.25' }],
        '28': ['1.75rem',   { lineHeight: '1.2' }],
        '32': ['2rem',      { lineHeight: '1.15' }],
        '42': ['2.625rem',  { lineHeight: '1.1' }],
        '44': ['2.75rem',   { lineHeight: '1.05' }],
        '52': ['3.25rem',   { lineHeight: '1.0' }],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight:   '-0.02em',
        normal:  '0em',
        wide:    '0.04em',
        wider:   '0.08em',
        widest:  '0.12em',
      },
      boxShadow: {
        'bss-sm':   '0 1px 3px rgba(26, 21, 16, 0.4)',
        'bss-md':   '0 4px 12px rgba(26, 21, 16, 0.5)',
        'bss-lg':   '0 8px 24px rgba(26, 21, 16, 0.6)',
        'bss-glow': '0 0 0 2px hsl(var(--ring))',
        'inner':    'inset 0 1px 2px rgba(26, 21, 16, 0.3)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.3s ease-out',
        'fade-up':        'fade-up 0.4s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}

export default config
