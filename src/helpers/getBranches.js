const exec = require('./exec');

module.exports = async repository => {
  let branches = (await exec(`cd ${repository} && git branch -a`))
    .stdout
    .slice(0, -1)
    .split('\n')
    .filter((branch) => {
      return branch.startsWith('  remotes/origin') && !branch.startsWith('  remotes/origin/HEAD -> ');
    })
    .map((branch) => {
      return branch.slice('  remotes/origin'.length - 1);
    });
    
  return branches;
}
