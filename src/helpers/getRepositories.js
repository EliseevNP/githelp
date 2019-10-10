const exec = require('./exec');

module.exports = async (source, verbose = false) => {
  try {
    return (await exec(`ls -d ${source}/*/`)).stdout.slice(0, -1).split('\n');
  } catch (err) {
    throw new Error(`An error occurred while trying to get a list of repositories.${(verbose ? `\n  ${err}` : '')}`);
  }
};
