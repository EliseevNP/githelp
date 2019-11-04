const yargs = require('yargs');
const options = require('../options');
const {
  exec,
  getPathsToRepositories,
  handleErrorVerbose,
  getCommitChangesCount,
  getMergeConfilctsCount,
} = require('../helpers');

module.exports.command = 'commit';

module.exports.description = 'Commit changes to the index in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.source)
    .option('m', {
      type: 'string',
      demandOption: 'You need specify commit message (-m, --message)',
      alias: 'message',
      description: 'Commit message',
    })
    .example('\'$ $0 commit -m message\'', 'Commit changes with the specified message');
};

module.exports.handler = async argv => {
  try {
    const pathsToRepositories = await getPathsToRepositories(argv.source, argv.verbose);

    await Promise.all(pathsToRepositories.map(repositoryPath => new Promise(async resolve => {
      try {
        if (await getMergeConfilctsCount(repositoryPath) !== 0) {
          console.log(`[ERROR] Commiting changes for '${repositoryPath}' repository failure. Merge conflicts found`);
          resolve();

          return;
        }

        if (await getCommitChangesCount(repositoryPath) === 0) {
          console.log(`[OK] Skiping commiting changes for '${repositoryPath}' repository. Files added to current commit not found`);
          resolve();

          return;
        }

        const { stdout, stderr } = (await exec(`cd ${repositoryPath} && git commit -m "${argv.message}" --quiet`));

        if (stderr) {
          console.log(`[ERROR] Commiting changes for '${repositoryPath}' repository failure${(argv.verbose) ? `\n${stderr}` : ''}`);
        } else {
          console.log(`[OK] Commiting changes for '${repositoryPath}' repository ... ok${(argv.verbose) ? `\n${stdout}` : ''}`);
        }

        resolve();
      } catch (err) {
        console.log(`[ERROR] Commiting changes for '${repositoryPath}' repository failure`);
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
