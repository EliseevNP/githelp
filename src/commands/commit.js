const yargs = require('yargs');
const exec = require('../helpers/exec');
const getRepositories = require('../helpers/getRepositories');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');
const getCommitChangesCount = require('../helpers/getCommitChangesCount');
const getMergeConfilctsCount = require('../helpers/getMergeConfilctsCount');

module.exports.command = 'commit';

module.exports.description = 'Commit changes to the index in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option('s', {
      type: 'string',
      default: '.',
      alias: 'source',
      description: 'The directory where the repositories are located in which you want to commit changes',
      coerce: arg => ((arg[arg.length - 1] === '/') ? arg.slice(0, -1) : arg),
    })
    .option('m', {
      type: 'string',
      demandOption: 'You need specify commit message (-m, --message)',
      alias: 'message',
      description: 'Commit message',
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
        if (await getMergeConfilctsCount(repository) !== 0) {
          console.log(`[ERROR] Commiting changes for '${repository}' repository failure. Merge conflicts found`);
          resolve();

          return;
        }

        if (await getCommitChangesCount(repository) === 0) {
          console.log(`[OK] Skiping commiting changes for '${repository}' repository. Files added to current commit not found`);
          resolve();

          return;
        }

        const { stdout, stderr } = (await exec(`cd ${repository} && git commit -m "${argv.message}" --quiet`));

        if (stderr) {
          console.log(`[ERROR] Commiting changes for '${repository}' repository failure${(argv.verbose) ? `\n${stderr}` : ''}`);
        } else {
          console.log(`[OK] Commiting changes for '${repository}' repository ... ok${(argv.verbose) ? `\n${stdout}` : ''}`);
        }

        resolve();
      } catch (err) {
        console.log(`[ERROR] Commiting changes for '${repository}' repository failure`);
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
