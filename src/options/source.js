module.exports = ['s', {
  type: 'string',
  default: '.',
  alias: 'source',
  description: 'The directory where the repositories are located',
  coerce: arg => ((arg[arg.length - 1] === '/') ? arg.slice(0, -1) : arg),
}];
