/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'panther-black': '#000000',
        'panther-gold': '#FFD700',
        'panther-yellow': '#FFEB3B',
        'panther-dark': '#1a1a1a',
        'panther-darker': '#0a0a0a',
        'panther-glow': '#FFD700',
        'panther-accent': '#FFA500',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'matrix': 'matrix 20s linear infinite',
        'nebula': 'nebula 15s ease-in-out infinite',
        'warp': 'warp 10s ease-in-out infinite',
        'quantum': 'quantum 8s ease-in-out infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
        'energy': 'energy 3s ease-in-out infinite',
        'portal': 'portal 12s ease-in-out infinite',
        'timewarp': 'timewarp 18s ease-in-out infinite',
        'dimension': 'dimension 25s ease-in-out infinite',
        'cosmic': 'cosmic 30s ease-in-out infinite',
        'stellar': 'stellar 22s ease-in-out infinite',
        'galactic': 'galactic 35s ease-in-out infinite',
        'interstellar': 'interstellar 40s ease-in-out infinite',
        'multiverse': 'multiverse 50s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700' },
          '100%': { boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)' },
        },
        nebula: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
        },
        warp: {
          '0%': { transform: 'perspective(1000px) rotateY(0deg)' },
          '100%': { transform: 'perspective(1000px) rotateY(360deg)' },
        },
        quantum: {
          '0%': { transform: 'scale(1) translateZ(0)' },
          '50%': { transform: 'scale(1.1) translateZ(100px)' },
          '100%': { transform: 'scale(1) translateZ(0)' },
        },
        hologram: {
          '0%': { opacity: '0.3', transform: 'translateY(0px)' },
          '50%': { opacity: '1', transform: 'translateY(-10px)' },
          '100%': { opacity: '0.3', transform: 'translateY(0px)' },
        },
        energy: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        portal: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.5)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        timewarp: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
        dimension: {
          '0%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
          '100%': { transform: 'perspective(1000px) rotateX(360deg) rotateY(360deg)' },
        },
        cosmic: {
          '0%': { transform: 'scale(1) rotate(0deg)', filter: 'hue-rotate(0deg)' },
          '100%': { transform: 'scale(1.5) rotate(360deg)', filter: 'hue-rotate(360deg)' },
        },
        stellar: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-50px) rotate(180deg)' },
          '100%': { transform: 'translateY(0px) rotate(360deg)' },
        },
        galactic: {
          '0%': { transform: 'scale(1) translateZ(0) rotate(0deg)' },
          '50%': { transform: 'scale(1.3) translateZ(200px) rotate(180deg)' },
          '100%': { transform: 'scale(1) translateZ(0) rotate(360deg)' },
        },
        interstellar: {
          '0%': { transform: 'perspective(2000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
          '100%': { transform: 'perspective(2000px) rotateX(360deg) rotateY(360deg) rotateZ(360deg)' },
        },
        multiverse: {
          '0%': { transform: 'scale(1) rotate(0deg) translateZ(0)', filter: 'hue-rotate(0deg) brightness(1)' },
          '25%': { transform: 'scale(1.2) rotate(90deg) translateZ(100px)', filter: 'hue-rotate(90deg) brightness(1.2)' },
          '50%': { transform: 'scale(1.5) rotate(180deg) translateZ(200px)', filter: 'hue-rotate(180deg) brightness(1.5)' },
          '75%': { transform: 'scale(1.2) rotate(270deg) translateZ(100px)', filter: 'hue-rotate(270deg) brightness(1.2)' },
          '100%': { transform: 'scale(1) rotate(360deg) translateZ(0)', filter: 'hue-rotate(360deg) brightness(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'panther-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23FFD700\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'matrix-bg': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23FFD700\" fill-opacity=\"0.1\"%3E%3Ctext x=\"50\" y=\"50\" font-family=\"monospace\" font-size=\"12\" text-anchor=\"middle\" dy=\".35em\"%3E01%3C/text%3E%3C/g%3E%3C/svg%3E')",
      },
      fontFamily: {
        'panther': ['Orbitron', 'monospace'],
        'tech': ['Rajdhani', 'sans-serif'],
        'matrix': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
} 