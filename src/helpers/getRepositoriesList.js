/* eslint-disable no-param-reassign */

const axios = require('axios');

module.exports = async (urls, all, page, perPage, output) => {
  let repositories = [];

  const validateStatus = status => status === 200;

  const mapRepositories = repositoryInfo => ({
    url: repositoryInfo.ssh_url_to_repo,
    output: `${output}/${repositoryInfo.path_with_namespace}`,
    path: repositoryInfo.path_with_namespace,
  });

  const getAllRepositories = async (baseURL, page = 1, repositories = []) => {
    const url = `${baseURL}&page=${page}&per_page=${100}`;

    const response = await axios.get(url, { validateStatus });

    if (response.data.length >= 0 && response.data.length < 100) {
      return [...repositories, ...response.data.map(mapRepositories)];
    }

    repositories = [...repositories, ...response.data.map(mapRepositories)];

    return await getAllRepositories(baseURL, ++page, repositories);
  };

  const getRepositoriesList = async baseURL => {
    if (all) {
      repositories = [...repositories, ...(await getAllRepositories(baseURL))];
    } else {
      const url = `${baseURL}&page=${page}&per_page=${perPage}`;

      const response = await axios.get(url, { validateStatus });

      repositories = [...repositories, ...response.data.map(mapRepositories)];
    }
  };

  await Promise.all(urls.map(getRepositoriesList));

  return repositories;
};
