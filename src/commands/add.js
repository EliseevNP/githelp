const yargs = require('yargs');
const options = require('../options');
const {
  exec,
  getPathsToRepositories,
  handleErrorVerbose,
  getMergeConfilctsCount,
} = require('../helpers');

module.exports.command = 'add';

module.exports.description = 'Add changes to the index in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.source)
    .example('\'$ $0 add\'', 'Add changes to the index');
};

module.exports.handler = async argv => {
  try {
    const pathsToRepositories = await getPathsToRepositories(argv.source, argv.verbose);

    await Promise.all(pathsToRepositories.map(repositoryPath => new Promise(async resolve => {
      try {
        if (await getMergeConfilctsCount(repositoryPath) !== 0) {
          console.log(`[ERROR] Adding changes for '${repositoryPath}' repository failure. Merge conflicts found`);
          resolve();

          return;
        }

        const { stdout, stderr } = (await exec(`cd ${repositoryPath} && git add .`));

        if (stderr) {
          console.log(`[ERROR] Adding changes for '${repositoryPath}' repository failure${(argv.verbose) ? `\n${stderr}` : ''}`);
        } else {
          console.log(`[OK] Adding changes for '${repositoryPath}' repository ... ok${(argv.verbose) ? `\n${stdout}` : ''}`);
        }
      } catch (err) {
        console.log(`[ERROR] Adding changes for '${repositoryPath}' repository failure`);
        if (argv.verbose) {
          handleErrorVerbose(err);
        }
        resolve();
      }
    })));
  } catch (err) {
    yargs.showHelp();
    console.log(`\n${argv.verbose ? err : err.message}`);
  }
};
