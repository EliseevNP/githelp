const exec = require('./exec');

// Returns merge conflicts count
// If folder located in 'repository' path is not git repository, then function return 0
module.exports = async repository => +(await exec(`cd ${repository} && git status -s 2>/dev/null | grep -E "^(DD|AU|UD|UA|DU|AA|UU)" | wc -l`)).stdout;
