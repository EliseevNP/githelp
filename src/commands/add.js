const yargs = require('yargs');
const exec = require('../helpers/exec');
const getRepositories = require('../helpers/getRepositories');

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
    const repositories = await getRepositories(argv.source, argv.verbose);

    await Promise.all(repositories.map(repository => new Promise(async resolve => {
      try {
        const { stdout, stderr } = (await exec(`cd ${repository} && git add .`));

        if (stderr) {
          console.log(`[ERROR] Adding changes for '${repository}' repository failure.${(argv.verbose) ? `\n${stderr}` : ''}`);
        } else {
          console.log(`[OK] Adding changes for '${repository}' repository ... ok.${(argv.verbose) ? `\n${stdout}` : ''}`);
        }
      } catch (err) {
        console.log(`[ERROR] Adding changes for '${repository}' repository failure.${(argv.verbose) ? `\n${err}` : ''}`);
        resolve();
      }
    })));
  } catch (err) {
    yargs.showHelp();
    console.log(`\n${err.message}`);
  }
};
