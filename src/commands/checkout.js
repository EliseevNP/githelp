const yargs = require('yargs');
const exec = require('../helpers/exec');
const getRepositories = require('../helpers/getRepositories');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');

module.exports.command = 'checkout <branch>';

module.exports.description = 'Switch branches in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option('s', {
      type: 'string',
      default: '.',
      alias: 'source',
      description: 'The directory where the repositories are located in which to switch branches',
      coerce: arg => ((arg[arg.length - 1] === '/') ? arg.slice(0, -1) : arg),
    })
    .option('b', {
      type: 'boolean',
      default: false,
      description: 'Apply -b flag to the \'git checkout\' command if specified <branch> is not exists',
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
        let branches = (await exec(`cd ${repository} && git branch --list`)).stdout.slice(0, -1).split('\n');

        branches = branches.map(branch => branch.slice(2));

        const currentBranch = (await exec(`cd ${repository} && git branch --show-current`)).stdout.slice(0, -1);

        if (currentBranch === argv.branch) {
          console.log(`[OK] Skiping checkout for '${repository}' repository. Already on '${argv.branch}'`);
          resolve();

          return;
        }

        const isBranchExists = branches.includes(argv.branch);

        if (!isBranchExists && !argv.b) {
          console.log(`[ERROR] Checkout for '${repository}' repository failure. Branch '${argv.branch}' doesn't exists (maybe you need -b option?)`);
          resolve();

          return;
        }

        if (!isBranchExists && argv.b) {
          await exec(`cd ${repository} && git checkout -b ${argv.branch}`);
        } else {
          await exec(`cd ${repository} && git checkout ${argv.branch}`);
        }

        console.log(`[OK] Checkout for '${repository}' repository ... ok`);
        resolve();
      } catch (err) {
        console.log(`[ERROR] Checkout for '${repository}' repository failure`);
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
