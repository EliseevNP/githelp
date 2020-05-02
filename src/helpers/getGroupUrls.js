const axios = require('axios');

const validateStatus = status => status === 200;
const mapSubgroups = subgroupInfo => ({
  subgroup: subgroupInfo.full_path,
});

const getSubgroups = async (argv, group) => {
  const getAllSubgroups = async (group, page = 1, subgroups = []) => {
    const url = `${argv.api_url}/groups/${encodeURIComponent(group)}/subgroups?access_token=${argv.access_token}&visibility=${argv.visibility}&simple=true&page=${page}&per_page=${100}`;

    const response = await axios.get(url, { validateStatus });

    if (response.data.length >= 0 && response.data.length < 100) {
      return [...subgroups, ...response.data.map(mapSubgroups)];
    }

    // eslint-disable-next-line no-param-reassign
    subgroups = [...subgroups, ...response.data.map(mapSubgroups)];

    // eslint-disable-next-line no-param-reassign
    return getAllSubgroups(group, ++page, subgroups);
  };

  const groupSubgroups = await getAllSubgroups(group);

  if (!groupSubgroups.length) {
    return [];
  }

  return [
    ...groupSubgroups.map(({ subgroup }) => subgroup),
    ...(await Promise.all(groupSubgroups
      .map(({ subgroup }) => getSubgroups(argv, subgroup))))
      .flat(),
  ];
};

module.exports = async argv => {
  const subgroups = await getSubgroups(argv, argv.group);

  return [argv.group, ...subgroups].map(group => (
    `${argv.api_url}/groups/${encodeURIComponent(group)}/projects?access_token=${argv.access_token}&visibility=${argv.visibility}&simple=true`
  ));
};
