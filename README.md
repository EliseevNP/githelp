# githelp

CLI for performing routine operations with git

## Install

```sh
$ npm i githelp -g
```

## Usage

```sh
$ githelp --help
```
Help output:
```
githelp <command>

Commands:
  cli.js clone  Clone all repositories available to you by access token into output directory

Options:
  --version   Show version number  [boolean]
  -h, --help  Show help  [boolean]
```

## Available commands

* [clone](#clone)

### clone

> You need add ssh key in your gitlab account for using this command

```sh
$ githelp clone --help
```
Help output:
```
githelp clone

Clone all repositories available to you by access token into output directory

Options:
  --version           Show version number  [boolean]
  -t, --access_token  Access token (now provide only gitlab access token)  [string] [required]
  -o, --output        Output directory  [string] [default: "./output"]
  --api_url           API URL (now provide only gitlab API). Examples of correct API URL's:
                        - https://gitlab.com/api/v4
                        - https://gitlab.example.xyz/api/v4
                        - gitlab.com
                        - gitlab.example.xyz  [string] [default: "https://gitlab.com/api/v4"]
  -p, --page          Page number  [number] [default: 1]
  --per_page          Number of items to list per page  [number] [default: 20]
  -g, --group         Clone only repositories of the specified group  [string]
  -a, --all           Clone all available repositories ('page' and 'per_page' options will be ignored)  [boolean] [default: false]
  -f, --force         Folders located in the output directory and having the same names as the cloned repositories will be deleted before cloning  [boolean] [default: false]
  -v, --verbose       Show details about the result of running command  [boolean] [default: false]
  -h, --help          Show help  [boolean]
 ```

## License

MIT.