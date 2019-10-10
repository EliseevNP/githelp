const exec = require('./exec');

// Returns an array containing the paths to the repositories relative to the source directory
module.exports = async (source, verbose) => {
  try {
    return (await exec(`ls -d ${source}/*/`)).stdout.slice(0, -1).split('\n');
  } catch (err) {
    throw new Error(`An error occurred while trying to get a list of repositories.${(verbose ? `\n  ${err}` : '')}`);
  }
};
