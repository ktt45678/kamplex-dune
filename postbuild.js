const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const { projects } = require('./angular.json');
const defaultProject = Object.keys(projects)[0];

(async () => {
  // find the styles css file
  const files = await getFilesFromPath(`./dist/${defaultProject}`, '.css');
  let data = [];

  if (!files || files.length <= 0) {
    console.log('cannot find style files to purge');
    return;
  }

  for (let f of files) {
    // get original file size
    const originalSize = await getFilesizeInKiloBytes(`./dist/${defaultProject}/${f}`) + 'kb';
    var o = { 'file': f, 'originalSize': originalSize, 'newSize': '' };
    data.push(o);
  }

  console.log('Run PurgeCSS...');

  await new Promise((resolve, reject) => {
    exec(`purgecss -c purgecss.config.js`, async function (error, stdout, stderr) {
      if (error)
        reject(error);

      console.log('PurgeCSS done');
      console.log();

      for (let d of data) {
        // get new file size
        const newSize = (await getFilesizeInKiloBytes(`./dist/${defaultProject}/${d.file}`)) + 'kb';
        d.newSize = newSize;
      }

      console.table(data);
      resolve();
    });
  });

  console.log('Copy Service Workers file...');

  await fs.promises.copyFile('./src/assets/js/ngsw/ngsw-worker.js', `./dist/${defaultProject}/ngsw-worker.js`);

  console.log('File copied');

  console.log('Run ngsw config...');

  await new Promise((resolve, reject) => {
    exec(`ngsw-config dist/${defaultProject} ngsw-config.json`, async function (error, stdout, stderr) {
      if (error)
        reject(error);

      console.log('Ngsw config done');
      console.log();

      resolve();
    });
  });
})();

async function getFilesizeInKiloBytes(filename) {
  var stats = await fs.promises.stat(filename);
  var fileSizeInBytes = stats.size / 1024;
  return fileSizeInBytes.toFixed(2);
}

async function getFilesFromPath(dir, extension) {
  let files = await fs.promises.readdir(dir);
  return files.filter(e => path.extname(e).toLowerCase() === extension);
}
