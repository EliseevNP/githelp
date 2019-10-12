const yargs = require('yargs');
const exec = require('../helpers/exec');
const getPathsToRepositories = require('../helpers/getPathsToRepositories');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');

module.exports.command = 'pull';

module.exports.description = 'For all repositories located in the source directory changes from their remote repositories will be pulled';

module.exports.builder = yargs => {
  yargs
    .option('s', {
      type: 'string',
      default: '.',
      alias: 'source',
      description: 'The directory where the repositories for which you want to pull changes are located',
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
