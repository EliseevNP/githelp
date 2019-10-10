const exec = require('./exec');

module.exports = async repository => {
  const branches = (await exec(`cd ${repository} && git branch -a`))
    .stdout
    .slice(0, -1)
    .split('\n')
    .map(branch => ((branch.startsWith('  remotes/origin/')) ? branch.slice('  remotes/origin/'.length) : branch.slice(2)));

  return branches;
};
