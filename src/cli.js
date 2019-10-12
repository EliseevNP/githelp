#!/usr/bin/env node

require('yargs') // eslint-disable-line no-unused-expressions
  .commandDir('commands')
  .locale('en')
  .wrap(null)
  .alias('h', 'help')
  .demandCommand(1, 'You need specify at least one command for using this tool')
  .argv;
