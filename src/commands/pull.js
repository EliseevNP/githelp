const yargs = require('yargs');
const options = require('../options');
const { exec, getPathsToRepositories, handleErrorVerbose } = require('../helpers');

module.exports.command = 'pull';

module.exports.description = 'For all repositories located in the source directory changes from their remote repositories will be pulled';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.source)
    .example('\'$ $0 pull\'', 'Pull changes');
};

module.exports.handler = async argv => {
  try {
    const pathsToRepositories = await getPathsToRepositories(argv.source, argv.verbose);

    for (let i = 0; i < pathsToRepositories.length; i++) {
      try {
        console.log(`[INFO] Pulling for '${pathsToRepositories[i]}' repository ...`);

        const { stdout, stderr } = (await exec(`cd ${pathsToRepositories[i]} && git pull --quiet`));

        if (stderr) {
          console.log(`[ERROR] Pulling for '${pathsToRepositories[i]}' repository failure${(argv.verbose) ? `\n${stderr}` : ''}`);
        } else {
          console.log(`[OK] Pulling for '${pathsToRepositories[i]}' repository ... ok${(argv.verbose) ? `\n${stdout}` : ''}`);
        }
      } catch (err) {
        console.log(`[ERROR] Pulling for '${pathsToRepositories[i]}' repository failure`);
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
