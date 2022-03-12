const { guessProductionMode } = require('@ngneat/tailwind');
const plugin = require('tailwindcss/plugin');
const _ = require('lodash');

process.env.TAILWIND_MODE = guessProductionMode() ? 'build' : 'watch';

module.exports = {
  prefix: 'tw-',
  mode: 'jit',
  content: [
    './src/**/*.{html,ts,css,scss,sass,less,styl}',
  ],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class', // or 'media' or 'class'
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
        '20': '.2',
        '25': '.25',
        '30': '.3',
        '35': '.35',
        '40': '.4'
      },
      colors: {
        neutral: {
          '625': '#393939',
          '650': '#424242',
          '675': '#464646',
          '850': '#212121',
          '875': '#1e1e1e'
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
                'flex': '0 1 auto'
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
