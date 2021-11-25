const { guessProductionMode } = require('@ngneat/tailwind');
const plugin = require('tailwindcss/plugin');
const _ = require('lodash');

process.env.TAILWIND_MODE = guessProductionMode() ? 'build' : 'watch';

module.exports = {
  prefix: '',
  mode: 'jit',
  purge: {
    content: [
      './src/**/*.{html,ts,css,scss,sass,less,styl}',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    dropdownColumns: theme => ({
      '2': theme('width.1/2'),
      '3': theme('width.1/3'),
      '4': theme('width.1/4'),
      '5': theme('width.1/5')
    }),
    extend: {
      boxShadow: {
        'border': '0 0 0 1px rgba(0, 0, 0, 0.1)'
      },
      brightness: {
        '40': '.4'
      },
      colors: {
        neutral: {
          '50': '#fafafa',
          '100': '#f5f5f5',
          '200': '#e5e5e5',
          '300': '#d4d4d4',
          '400': '#a3a3a3',
          '500': '#737373',
          '600': '#525252',
          '650': '#424242',
          '700': '#404040',
          '800': '#262626',
          '850': '#212121',
          '900': '#171717'
        }
      },
      lineHeight: {
        '5xl': '1.1'
      },
      margin: {
        '5%': '5%'
      },
      maxHeight: {
        'fill-available': '-webkit-fill-available'
      },
      maxWidth: {
        '8xl': '90rem'
      },
      screens: {
        '3xl': '1600px',
        '4xl': '2000px'
      },
      zIndex: {
        '-1': '-1'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
    plugin(function ({ addUtilities, addVariant, config, e }) {
      addUtilities(_.map(config('theme.dropdownColumns'), (value, key) => {
        return {
          [`.${e(`dropdown-cols-${key}`)}`]: {
            'ul': {
              'display': 'flex',
              'flex-wrap': 'wrap',
              '> *': {
                'min-width': value,
                'width': value,
                'flex': '1 0 auto'
              }
            }
          }
        }
      }));
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
