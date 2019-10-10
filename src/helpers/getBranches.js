const exec = require('./exec');

// Returns an array containing the names of all branches (local and remote)
module.exports = async repository => {
  const branches = (await exec(`cd ${repository} && git branch -a`))
    .stdout
    .slice(0, -1)
    .split('\n')
    .map(branch => ((branch.startsWith('  remotes/origin/')) ? branch.slice('  remotes/origin/'.length) : branch.slice(2)));

  return branches;
};
