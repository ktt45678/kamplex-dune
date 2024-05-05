/** @type {import('tailwindcss').Config} */
import { guessProductionMode } from '@ngneat/tailwind';
import plugin from 'tailwindcss/plugin';
import _ from 'lodash-es';

process.env.TAILWIND_MODE = guessProductionMode() ? 'build' : 'watch';

export default {
  prefix: 'tw-',
  mode: 'jit',
  content: [
    './src/**/*.{html,ts,css,scss,sass,less,styl}',
  ],
  corePlugins: {
    preflight: false,
    aspectRatio: false
  },
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    dropdownColumns: theme => ({
      '2': theme('width.1/2'),
      '3': theme('width.1/3'),
      '4': theme('width.1/4'),
      '5': theme('width.1/5')
    }),
    screens: {
      'xs': '360px',
      '2xs': '460px',
      'sm': '640px',
      'md': '768px',
      '2md': '1018px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1600px',
      '4xl': '2000px'
    },
    extend: {
      boxShadow: {
        'border': '0 0 0 1px rgba(0, 0, 0, 0.1)',
        'focus-box': '0 0 0 3px #A855F7'
      },
      brightness: {
        '20': '.2',
        '25': '.25',
        '30': '.3',
        '35': '.35',
        '40': '.4'
      },
      colors: {
        app: {
          'body': '#111111',
          'primary': '#526ED3',
          'backdrop': '#212121',
          'link': '#58a6ff'
        },
        neutral: {
          '620': '#575757',
          '625': '#393939',
          '650': '#424242',
          '675': '#464646',
          '725': '#303030',
          '850': '#212121',
          '875': '#1e1e1e',
          '925': '#1c1c1c'
        }
      },
      content: {
        'invisible': '\'\\200b\'',
        'dot': '\'\\2022\''
      },
      lineHeight: {
        '3.5': '14px',
        '5xl': '1.1'
      },
      margin: {
        '5%': '5%'
      },
      height: {
        'screen-50': '50vh',
        'screen-75': '75vh',
        'screen-80': '80vh'
      },
      maxHeight: {
        'fill-available': '-webkit-fill-available'
      },
      maxWidth: {
        '115px': '115px',
        '8xl': '90rem'
      },
      opacity: {
        '6': '0.06'
      },
      spacing: {
        '1.75': '0.4rem',
        '34': '8.5rem',
        '76': '19rem',
        '30px': '30px'
      },
      transformOrigin: {
        'left-center': 'left center'
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'width-height': 'width, height',
        'left': 'left',
        'top': 'top',
        'left': 'left',
        'right': 'right',
        'bottom': 'bottom'
      },
      transitionDelay: {
        '25': '25ms',
        '50': '50ms'
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5'
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('vidstack/tailwind.cjs'),
    plugin(function ({ addComponents, addUtilities, addVariant, config, e }) {
      addComponents({
        '.vertical-tab-menu': {
          'width': 'var(--menu-width)',
          'height': 'calc(var(--content-height) - var(--menu-spacing-y) * 2)',
          'margin-left': 'var(--menu-spacing-x)',
          'margin-top': 'var(--menu-spacing-y)',
          'margin-bottom': 'var(--menu-spacing-y)'
        },
        '.vertical-tab-content': {
          'height': 'var(--content-height)'
        },
        '.vertical-tab-content-md': {
          'width': 'calc(var(--content-width) - var(--menu-width) - var(--menu-spacing-x))'
        },
        '.vertical-tab-content-sm': {
          'width': 'var(--content-width)'
        }
      });
      addUtilities(_.map(config('theme.dropdownColumns'), (value, key) => {
        return {
          [`.${e(`dropdown-cols-${key}`)}`]: {
            'ul': {
              'display': 'flex',
              'flex-wrap': 'wrap',
              '> *': {
                'min-width': value,
                'width': value,
                'flex': '0 1 auto'
              }
            }
          }
        }
      }));
      addUtilities({
        '.absolute-center': {
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)'
        }
      });
      /*
      addUtilities(_.map(config('theme.spacing'), (value, key) => {
        return {
          [`.${e(`dropdown-gap-${key}`)}`]: {
            'ul': {
              '-moz-column-gap': `${value}`,
              '-webkit-column-gap': `${value}`,
              'column-gap': `${value}`
            }
          }
        }
      }));
      */
      addVariant('not-disabled', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`not(disabled)${separator}${className}`)}:not(disabled)`
        })
      });
    })
  ]
};
