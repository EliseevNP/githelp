const yargs = require('yargs');
const axios = require('axios');
const { getRepositoryNames, handleErrorVerbose } = require('../helpers');
const options = require('../options');

module.exports.command = 'merge-request';

module.exports.description = 'Create merge request in all repositories located in the source directory';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.access_token)
    .option(...options.source)
    .option(...options.api_url)
    .option('source_branch', {
      type: 'string',
      demandOption: 'To create merge request you need specify source branch (--source_branch)',
      description: 'The source branch',
    })
    .option('target_branch', {
      type: 'string',
      demandOption: 'To create merge request you need specify target branch (--target_branch)',
      description: 'The target branch',
    })
    .option('title', {
      type: 'string',
      demandOption: 'To create merge request you need specify title (--title)',
      description: 'Title of MR',
    })
    .option('remove_source_branch', {
      type: 'boolean',
      default: true,
      description: 'Flag indicating if a merge request should remove the source branch when merging',
    })
    .option('squash', {
      type: 'boolean',
      default: true,
      description: 'Squash commits into a single commit when merging',
    })
    .example('\'$ $0 merge-request --target_branch=staging --source_branch=hot-fix --title="WIP: hot fix" -t 3FQtg-vF8cNjkSr2X9vc\'', 'Create MR from hot-fix to staging with specified title');
};

module.exports.handler = async argv => {
  try {
    const repositories = await getRepositoryNames(argv.source, argv.verbose);

    await Promise.all(repositories.map(repository => new Promise(async resolve => {
      try {
        await axios.post(`${argv.api_url}/projects/${encodeURIComponent(`${repository.namespace}/${repository.name}`)}/merge_requests?access_token=${argv.access_token}`, {
          title: argv.title,
          source_branch: argv.source_branch,
          target_branch: argv.target_branch,
          remove_source_branch: argv.remove_source_branch,
          squash: argv.squash,
        }, {
          validateStatus: status => status === 201,
        });

        console.log(`[OK] MR for '${repository.namespace}/${repository.name}' repository succesfully created`);

        resolve();
      } catch (err) {
        console.log(`[ERROR] MR for '${repository.namespace}/${repository.name}' repository not created`);

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
