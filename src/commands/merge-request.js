const yargs = require('yargs');
const axios = require('axios');
const getRepositoryNames = require('../helpers/getRepositoryNames');
const handleErrorVerbose = require('../helpers/handleErrorVerbose');

module.exports.command = 'merge-request';

module.exports.description = 'Create merge request in all repositories located in source directory';

module.exports.builder = yargs => {
  yargs
    .option('t', {
      type: 'string',
      demandOption: 'Please specify access token for using \'merge-request\' command (-t, --access_token)',
      alias: 'access_token',
      description: 'Access token (now provide only gitlab access token)',
    })
    .option('s', {
      type: 'string',
      default: '.',
      alias: 'source',
      description: 'The directory where the repositories are located in which you want to create merge request',
      coerce: arg => ((arg[arg.length - 1] === '/') ? arg.slice(0, -1) : arg),
    })
    .option('api_url', {
      type: 'string',
      default: 'https://gitlab.com/api/v4',
      description: 'API URL (now provide only gitlab API). Examples of correct API URL\'s:\n  - https://gitlab.com/api/v4\n  - https://gitlab.example.xyz/api/v4\n  - gitlab.com \n  - gitlab.example.xyz',
      coerce: arg => {
        if (arg.match(/https:\/\/gitlab\.([\x00-\x7F]*)\/api\/v4/)) { // [\x00-\x7F] - ASCII symbols
          return arg;
        }

        return `https://${arg}/api/v4`;
      },
    })
    .option('source_branch', {
      type: 'string',
      demandOption: 'To create merge request you need specify source branch (--source_branch)',
      description: 'The source branch',
    })
    .option('target_branch', {
      type: 'string',
      demandOption: 'To create merge request you need specify source branch (--target_branch)',
      description: 'The target branch',
    })
    .option('title', {
      type: 'string',
      demandOption: 'To create merge request you need specify title (--title)',
      description: 'Title of MR',
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
    const repositories = await getRepositoryNames(argv.source, argv.verbose);

    await Promise.all(repositories.map(repository => new Promise(async resolve => {
      try {
        // TODO: encode url
        await axios.post(`${argv.api_url}/projects/${repository.namespace}%2F${repository.name}/merge_requests?access_token=${argv.access_token}`, {
          title: argv.title,
          source_branch: argv.source_branch,
          target_branch: argv.target_branch,
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
