const yargs = require('yargs');
const {
  exec,
  getPathsToRepositories,
  handleErrorVerbose,
  getBranches,
  getCurrentBranch,
} = require('../helpers');

const options = require('../options');

module.exports.command = 'checkout <branch>';

module.exports.description = 'Switch branches in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.source)
    .option('b', {
      type: 'boolean',
      default: false,
      description: 'Apply -b flag to the \'git checkout\' command if specified <branch> is not exists',
    })
    .example('\'$ $0 checkout staging -b\'', 'Switch branch to staging (if staging is not exists, it will be created)');
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
    console.log(`\n${argv.verbose ? err : err.message}`);
  }
};
