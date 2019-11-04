const yargs = require('yargs');
const options = require('../options');
const { exec, getRepositoriesList, handleErrorVerbose } = require('../helpers');

module.exports.command = 'clone';

module.exports.description = 'Clone all repositories available to you by access token to the output directory';

module.exports.builder = yargs => {
  yargs
    .option(...options.verbose)
    .option(...options.access_token)
    .option(...options.api_url)
    .option('o', {
      type: 'string',
      default: './output',
      alias: 'output',
      description: 'Output directory',
      coerce: arg => ((arg[arg.length - 1] === '/') ? arg.slice(0, -1) : arg),
    })
    .option('p', {
      type: 'number',
      default: 1,
      alias: 'page',
      description: 'Page number',
      coerce: arg => {
        const error = 'Invalid argument: p\n';

        if (isNaN(arg)) {
          throw new Error(`${error}Page should be a number (-p, --page)`);
        }
        if (arg < 1) {
          throw new Error(`${error}Page should be more than 0 (-p, --page)`);
        }

        return arg;
      },
    })
    .option('per_page', {
      type: 'number',
      default: 20,
      description: 'Number of items to list per page',
      coerce: arg => {
        const error = 'Invalid argument: per_page\n';

        if (isNaN(arg)) {
          throw new Error(`${error}Per page should be a number (--per_page)`);
        }
        if (arg < 0 || arg > 100) {
          throw new Error(`${error}Per page should be between 0 and 100 (--per_page)`);
        }

        return arg;
      },
    })
    .option('g', {
      type: 'string',
      alias: 'group',
      description: 'Clone only repositories of the specified group',
    })
    .option('u', {
      type: 'string',
      alias: 'user',
      description: 'Clone only repositories of the specified user',
    })
    .option('a', {
      type: 'boolean',
      default: false,
      alias: 'all',
      description: 'Clone all available repositories (\'page\' and \'per_page\' options will be ignored)',
    })
    .option('f', {
      type: 'boolean',
      default: false,
      alias: 'force',
      description: 'Folders located in the output directory and having the same names as the cloned repositories will be deleted before cloning',
    })
    .option('visibility', {
      type: 'string',
      default: 'private',
      choices: ['public', 'internal', 'private'],
      description: 'Visibility level (now provide only gitlab visibility levels: public, internal or private)',
    })
    .example('\'$ $0 clone --user=eliseevNP -t 3FQtg-vF8cNjkSr2X9vc\'', 'Clone all private repositories belongs to the \'eliseevNP\' user');
};

module.exports.handler = async argv => {
  try {
    const urls = [];

    if (argv.group) {
      urls.push(`${argv.api_url}/groups/${encodeURIComponent(argv.group)}/projects?access_token=${argv.access_token}&visibility=${argv.visibility}&simple=true`);
    }

    if (argv.user) {
      urls.push(`${argv.api_url}/users/${argv.user}/projects?access_token=${argv.access_token}&visibility=${argv.visibility}&simple=true`);
    }

    if (!argv.group && !argv.user) {
      urls.push(`${argv.api_url}/projects?access_token=${argv.access_token}&visibility=${argv.visibility}&simple=true`);
    }

    console.log('Getting list of available repositories ...');

    let repositories;

    try {
      repositories = await getRepositoriesList(urls, argv.all, argv.page, argv.per_page, argv.output);
    } catch (err) {
      console.log('[ERROR] An error occurred while trying to get a list of repositories');

      if (argv.verbose) {
        handleErrorVerbose(err);
      }

      return;
    }

    console.log(`Cloning repositories to the '${argv.output}' directory ...`);

    await Promise.all(repositories.map(repository => new Promise(async resolve => {
      const cloneRepository = async () => {
        try {
          await exec(`git clone ${repository.url} ${repository.output} --quiet`);
          console.log(`[OK] Cloning '${repository.path}' repository ... ok`);
          resolve();
        } catch (err) {
          console.log(`[ERROR] Cloning '${repository.path}' repository failure`);
          if (argv.verbose) {
            handleErrorVerbose(err);
          }
          resolve();
        }
      };

      const isRepositoryOutputExists = (await exec(`if [ -d ${repository.output} ]; then echo 1; fi`)).stdout === '1\n';

      if (isRepositoryOutputExists) {
        if (argv.force) {
          await exec(`rm -r ${repository.output}`);
          cloneRepository();
        } else {
          console.log(`[WARNING] Skip cloning '${repository.path}' repository${(argv.verbose) ? `\n  Directory '${repository.output}' already exists\n  Use -f (--force) option to enable deliting '${repository.output}' directory before cloning` : ''}`);
          resolve();
        }
      } else {
        cloneRepository();
      }
    })));
  } catch (err) {
    yargs.showHelp();
    console.log(`\n${err.message}`);
  }
};
