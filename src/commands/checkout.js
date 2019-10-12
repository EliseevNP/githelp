const yargs = require('yargs');
const exec = require('../helpers/exec');
const getPathsToRepositories = require('../helpers/getPathsToRepositories');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');
const getBranches = require('../helpers/getBranches');
const getCurrentBranch = require('../helpers/getCurrentBranch');

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
    const pathsToRepositories = await getPathsToRepositories(argv.source, argv.verbose);

    await Promise.all(pathsToRepositories.map(repositoryPath => new Promise(async resolve => {
      try {
        const currentBranch = await getCurrentBranch(repositoryPath);

        if (currentBranch === argv.branch) {
          console.log(`[OK] Skiping checkout for '${repositoryPath}' repository. Already on '${argv.branch}'`);
          resolve();

          return;
        }

        const isBranchExists = (await getBranches(repositoryPath)).includes(argv.branch);

        if (!isBranchExists && !argv.b) {
          console.log(`[ERROR] Checkout for '${repositoryPath}' repository failure. Branch '${argv.branch}' doesn't exists (maybe you need -b option?)`);
          resolve();

          return;
        }

        if (!isBranchExists && argv.b) {
          await exec(`cd ${repositoryPath} && git checkout -b ${argv.branch}`);
          console.log(`[OK] Checkout for '${repositoryPath}' repository ... ok (new branch '${argv.branch}' was created)`);
        } else {
          await exec(`cd ${repositoryPath} && git checkout ${argv.branch}`);
          console.log(`[OK] Checkout for '${repositoryPath}' repository ... ok`);
        }

        resolve();
      } catch (err) {
        console.log(`[ERROR] Checkout for '${repositoryPath}' repository failure`);
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
