const { defaultProject } = require('./angular.json')

module.exports = {
  content: [
    `dist/${defaultProject}/index.html`,
    `dist/${defaultProject}/*.js`
  ],
  css: [`dist/${defaultProject}/*.css`],
  safelist: {
    standard: [/tw-|plyr/]
  },
  output: `dist/${defaultProject}`
};
