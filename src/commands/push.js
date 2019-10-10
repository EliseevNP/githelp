const yargs = require('yargs');
const exec = require('../helpers/exec');
const getRepositories = require('../helpers/getRepositories');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');

module.exports.command = 'push';

module.exports.description = 'For all repositories located in the source directory push commited changes to appropriate remote repositories';

module.exports.builder = yargs => {
  yargs
    .option('s', {
      type: 'string',
      default: '.',
      alias: 'source',
      description: 'The directory where the repositories for which you want to push commited changes are located',
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
    const repositories = await getRepositories(argv.source, argv.verbose);

    for (let i = 0; i < repositories.length; i++) {
      try {
        console.log(`[INFO] Pushing for '${repositories[i]}' repository ...`);

        const { stdout, stderr } = (await exec(`cd ${repositories[i]} && git push --quiet`));

        if (stderr) {
          console.log(`[ERROR] Pushing for '${repositories[i]}' repository failure${(argv.verbose) ? `\n${stderr}` : ''}`);
        } else {
          console.log(`[OK] Pushing for '${repositories[i]}' repository ... ok${(argv.verbose) ? `\n${stdout}` : ''}`);
        }
      } catch (err) {
        console.log(`[ERROR] Pushing for '${repositories[i]}' repository failure`);
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
