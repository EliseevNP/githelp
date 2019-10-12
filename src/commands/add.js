const yargs = require('yargs');
const exec = require('../helpers/exec');
const getPathsToRepositories = require('../helpers/getPathsToRepositories');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');
const getMergeConfilctsCount = require('../helpers/getMergeConfilctsCount');

module.exports.command = 'add';

module.exports.description = 'Add changes to the index in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option('s', {
      type: 'string',
      default: '.',
      alias: 'source',
      description: 'The directory where the repositories are located in which you want to add changes to the index',
      coerce: arg => ((arg[arg.length - 1] === '/') ? arg.slice(0, -1) : arg),
    })
    .option('v', {
      type: 'boolean',
      default: false,
      alias: 'verbose',
      description: 'Show details about the result of running command',
    });
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
    console.log(`\n${err.message}`);
  }
};
