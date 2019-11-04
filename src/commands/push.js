const yargs = require('yargs');
const exec = require('../helpers/exec');
const options = require('../options');
const { getPathsToRepositories, handleErrorVerbose, getCurrentBranch } = require('../helpers');

module.exports.command = 'push';

module.exports.description = 'For all repositories located in the source directory push commited changes to appropriate remote repositories';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.source)
    .example('\'$ $0 push\'', 'Push changes');
};

module.exports.handler = async argv => {
  try {
    const pathsToRepositories = await getPathsToRepositories(argv.source, argv.verbose);

    for (let i = 0; i < pathsToRepositories.length; i++) {
      try {
        console.log(`[INFO] Pushing for '${pathsToRepositories[i]}' repository ...`);

        const currentBranch = await getCurrentBranch(pathsToRepositories[i]);

        const { stdout } = (await exec(`cd ${pathsToRepositories[i]} && git push --set-upstream origin ${currentBranch} --porcelain 2>/dev/null`));

        if (stdout[stdout.indexOf('\n') + 1] === '!') {
          console.log(`[ERROR] Pushing for '${pathsToRepositories[i]}' repository failure${(argv.verbose) ? `\n${stdout}` : ''}`);
        } else {
          console.log(`[OK] Pushing for '${pathsToRepositories[i]}' repository ... ok${(argv.verbose) ? `\n${stdout}` : ''}`);
        }
      } catch (err) {
        console.log(`[ERROR] Pushing for '${pathsToRepositories[i]}' repository failure`);
        if (argv.verbose) {
          handleErrorVerbose(err);
        }
      }
    }
  } catch (err) {
    yargs.showHelp();
    console.log(`\n${err.message}`);
  }
};
