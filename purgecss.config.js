const { projects } = require('./angular.json');
const defaultProject = Object.keys(projects)[0];

module.exports = {
  content: [
    `dist/${defaultProject}/index.html`,
    `dist/${defaultProject}/*.js`
  ],
  css: [`dist/${defaultProject}/*.css`],
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  safelist: {
    standard: ['tw-', 'plyr']
  },
  output: `dist/${defaultProject}`
};
