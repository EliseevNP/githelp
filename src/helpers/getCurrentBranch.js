const exec = require('./exec');

// Returns the name of current branch
module.exports = async repository => (await exec(`cd ${repository} && git branch`))
  .stdout
  .split('\n')
  .slice(0, -1)
  .filter(branch => branch.startsWith('*'))
  .map(currentBranch => currentBranch.slice(2))[0];
