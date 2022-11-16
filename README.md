Try on: [Codespace](https://github.com/codespaces/new?template_repository=abernier%2Ftpl-react-three) | [CodeSandbox](https://codesandbox.io/s/github/abernier/tpl-react-three)

# INSTALL

Pre-requisites:

- Node

```sh
$ npm ci
```

# Dev

```sh
$ npm run dev
```

# Build

```sh
$ npm run build
```

## Deploy

Pre-requisites: 

- Make sure you have Github Pages set to `Github Actions` in your [project's Settings](/../../settings/pages)

A Github Actions [deploy](.github/workflows/deploy.yml) task will build and deploy to `https://{username}.github.io/{reponame}` when pushing on `main`.
