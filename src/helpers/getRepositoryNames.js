const exec = require('./exec');
const getRepositories = require('./getRepositories');

// Returns an array containing the objects with name and namespace of the repositories relative to the source directory
module.exports = async (source, verbose) => {
  try {
    const repositories = await getRepositories(source, verbose);

    const result = await Promise.all(repositories.map(repositoryPath => new Promise(async (resolve, reject) => {
      try {
        let name = (await exec(`cd ${repositoryPath} && git remote -v`))
          .stdout
          .slice(0, -1)
          .split('\n')[0];

        let namespace = (await exec(`cd ${repositoryPath} && git remote -v`))
          .stdout
          .slice(0, -1)
          .split('\n')[0];

        name = name.slice(name.lastIndexOf('/') + 1, name.indexOf('.git'));
        namespace = namespace.slice(namespace.indexOf(':') + 1, namespace.lastIndexOf('/'));

        resolve({
          name,
          namespace,
        });
      } catch (err) {
        reject(err);
      }
    })));

    return result;
  } catch (err) {
    throw new Error(`An error occurred while trying to get an array of repository names${(verbose ? `\n  ${err}` : '')}`);
  }
};
