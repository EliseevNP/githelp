const exec = require('./exec');

// Returns the number of files added to the commit
// If folder located in 'repository' path is not git repository, then function return 0
module.exports = async repository => +(await exec(`cd ${repository} && git status --porcelain | grep "^A" | wc -l`)).stdout;
