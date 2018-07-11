[![Build Status](https://travis-ci.org/amv-networks/amv-ts-demo-app.svg?branch=master)](https://travis-ci.org/amv-networks/amv-ts-demo-app)
[![License](https://img.shields.io/github/license/amv-networks/amv-ts-demo-app.svg?maxAge=2592000)](https://github.com/amv-networks/amv-ts-demo-app/blob/master/LICENSE)

# amv-ts-demo-app

## Getting started

**Warning**

> Verify that you are running at least node 8.9.x and npm 5.x.x by running node -v and npm -v in a terminal/console window. Older versions produce errors, but newer versions are fine.

1. Go to project folder and install dependencies.
 ```bash
 npm install
 ```

2. Launch development server:
 ```bash
 npm start
 ```

## Usage

Tasks                    | Description
-------------------------|---------------------------------------------------------------------------------------
npm i                    | Install dependencies
npm start                | Start the app in development mode
npm run test             | Run unit tests with karma and jasmine
npm run e2e              | Run end to end tests with protractor
npm run build            | Build the app for production
npm run build-all        | Build the app for production & development
npm run build-gh         | Build gh-pages
npm run lint             | Run the linter (tslint)
npm run ci               | Execute linter and tests
npm run sme              | Build and run source map explorer
npm run release          | Create a new release using standard-version
npm run docker           | Build the docker image and run the container

## Travis CI

We use Travis CI to run this tasks in order:
* Linter
* Tests
* Build for production

## Contributing

- Please see the CONTRIBUTING file for guidelines.
- Create **pull requests, submit bugs, suggest new features** or documentation updates

## License
The project is licensed under the Apache License. See [LICENSE](LICENSE) for details.