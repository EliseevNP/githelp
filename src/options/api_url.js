module.exports = ['api_url', {
  type: 'string',
  default: 'https://gitlab.com/api/v4',
  description: 'API URL (now provide only gitlab API). Examples of correct API URL\'s:\n  - https://gitlab.com/api/v4\n  - https://gitlab.example.xyz/api/v4\n  - gitlab.com \n  - gitlab.example.xyz',
  coerce: arg => {
    if (arg.match(/https:\/\/gitlab\.([\x20-\x7F]*)\/api\/v4/)) { // [\x20-\x7F] - ASCII symbols
      return arg;
    }

    return `https://${arg}/api/v4`;
  },
}];
