/** @type {import('tailwindcss').Config} */
const colors = require('./tailwind/tailwind.color')
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ...colors
      },
      borderRadius: {
        'custom-sm':'0.25rem'
      },
      boxShadow:{
        'image':'0px -1px 8px rgba(143, 143, 143, 0.3)',
        'poster':'0px 0px 0.1px 2px rgba(124,124,124,1)',
        'footer':'0px -5px 10px rgba(255,255,255,1)',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        slideVoiceOut:{
          '0%': {maxHeight:'0px',overflow:'hidden'},
          '100%': {maxHeight:'12rem',overflow: 'hidden'},
        },
        slideVoiceIn: {
          '0%': { maxHeight:'12rem',overflow: 'hidden'},
          '100%': { maxHeight:'0px' ,overflow: 'hidden'},
        },
        downArrowRotateUp: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
        downArrowRotateDown: {
          '0%': { transform: 'rotate(180deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        slideCommentsOut:{
          '0%': {maxHeight:'0px',overflow:'hidden'},
          '100%': {maxHeight:'1000px',overflow: 'hidden'},
        },
        slideCommentsIn: {
          '0%': { maxHeight:'1000px',overflow: 'hidden'},
          '100%': { maxHeight:'0px' ,overflow: 'hidden'},
        },
        rotate:{
          '0%': { transform : `rotate(0deg)`},
          '100%': { transform : `rotate(360deg)`}
        },
        scaleCloverUp:{
          '0%': { transform : `scale(1)`},
          '100%': { transform : `scale(1.3)`}
        },
        userListSettingsOut:{
          '0%': { transform: `translateX(0px)`, opacity: '0' },
          '100%': { transform: `translateX(336px)`, opacity: '1'}
        },
        userListSettingsIn:{
          '0%': { transform: `translateX(336px)`, opacity: '1' },
          '100%': { transform: `translateX(0px)`, opacity: '0'}
        },
        cellScale:{
          '0%': { transform : `scale(0)`},
          '100%': { transform : `scale(1.15)`}
        },
      },
      transitionProperty: {
        'left': 'left',  // Добавим свойство transition для left
      },
      animation: {
        userListSettingsOut: `userListSettingsOut 1s ease-in-out`,
        userListSettingsIn: `userListSettingsIn 1s ease-in-out`,
        rotate: `rotate 3s linear infinite`,
        slideIn: 'slideIn 1s ease-in-out',
        slideOut: 'slideOut 1s ease-in-out',
        slideVoiceIn: 'slideVoiceIn 0.4s forwards ease-in-out',
        slideVoiceOut: 'slideVoiceOut 0.4s forwards ease-in-out',
        slideCommentsOut: 'slideCommentsOut 0.5s forwards ease-in-out',
        slideCommentsIn: 'slideCommentsIn 0.5s forwards ease-in-out',
        downArrowRotateUp:'downArrowRotateUp 0.3s ease-in-out',
        downArrowRotateDown:'downArrowRotateDown 0.3s ease-in-out',
        cloverPulse: 'scaleCloverUp 0.5s ease-in-out infinite alternate',
        cellScale: 'cellScale 0.35s ease-in-out alternate',
      },
      backgroundImage: {
        'overlay-black': 'linear-gradient(0deg, rgba(0, 0, 0, 0.65) 71.9%, rgba(0, 0, 0, 0.45) 81.9%, rgba(0, 0, 0, 0.27) 89.9%, rgba(0, 0, 0, 0) 100%)',
        'orange-yellow': 'linear-gradient(to right, #F5ED04, #F3C83B)',
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        'custom-s':{max:'26rem'},
        'custom-s-200':{max:'29.4rem'},
        'custom-md': { max: '40.5rem' }, // 648px breakpoint
        'custom-md-2': { max: '47.5rem' },
        'custom-xs': { max: '36.25rem' },
        'custom-md-lg': { max: '53.125rem' },
        'custom-lg': { max: '59.125rem' },
        'custom-image':{max:'21.62rem'},
        'custom-320':{ max: '20rem',min:'0.1rem'},
        'custom-768':{ max: '48rem',min:'36rem'},
        'custom-1024':{ max: '64rem',min:'29.4rem'},
        'custom-1024-836':{ max: '64rem',min:'53.125rem'},
        'custom-836-576':{ max: '53.125rem',min:'36rem'},
        'custom-576':{ max: '36rem', min: '26rem'},
        'custom-1024-max':{ max: '64rem'},
        'custom-xl2':{max:'71.25rem'},
        'custom-920-675':{max:'57.5rem',min:'42.187rem'},
        'custom-675':{max:'42.187rem'},
        landscape:{
          raw:"(orientation:landscape)"
        }
      },
      fontFamily: {
        inknut: ['Inknut Antiqua', 'serif'], // The name you used in @font-face
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
