# devmode
[![NPM version](https://img.shields.io/npm/v/devmode.svg?style=flat)](https://www.npmjs.com/package/devmode "View this project on NPM")
[![NPM downloads](https://img.shields.io/npm/dm/devmode.svg?style=flat)](https://www.npmjs.com/package/devmode "View this project on NPM")
[![NPM license](https://img.shields.io/npm/l/devmode.svg?style=flat)](https://www.npmjs.com/package/devmode "View this project on NPM")
[![flattr](https://img.shields.io/badge/flattr-donate-yellow.svg?style=flat)](http://flattr.com/thing/3817419/luscus-on-GitHub)

![coverage](https://cdn.rawgit.com/luscus/devmode/master/reports/coverage.svg)
[![David](https://img.shields.io/david/luscus/devmode.svg?style=flat)](https://david-dm.org/luscus/devmode)
[![David](https://img.shields.io/david/dev/luscus/devmode.svg?style=flat)](https://david-dm.org/luscus/devmode#info=devDependencies)

A tool collection used in the development process.

Uses environment variables to enable or disable development mode functionality in your package.

## Installation

    npm install devmode --save
    
## Usage

### Load Package

    var devmode = require('devmode');

### Stage Environment Variable Name

    // set a custom variable name. default is 'STAGE'
    devmode.STAGE_ENV_VARIABLE_NAME = <YOUR_STAGE_ENV_VARIABLE_NAME>;

### Method "isActive"

    if (devmode.isActive()) {
      // code will run only in dev mode, which means
      // process.env.<YOUR_STAGE_ENV_VARIABLE_NAME> equals 'LAB' or 'LOCAL'
    }

### Method "require"

    var dependency = devmode.require('dependency');

Depending on the dev mode status, the dependency package will be loaded
from the `node_modules` (disabled) or from the `workplace directory` (enabled)
where your packages are maintained.

It is very useful if your package relays on modules that you also
have maintain or to extend. In devmode the modules are loaded from
the `workplace directory` and you can edit, test and commit them directly.

<pre>
    <WORKPLACE>
      |_ package
      |    |
      |    |_ node_modules
      |         |
      |         |_ devmode
      |         |_ package.module.1 (loaded on devmode disabled)
      |         |_ package.module.2 (loaded on devmode disabled)
      |    
      |_ package.module.1 (loaded on devmode enabled)
      |_ package.module.2 (loaded on devmode enabled)
</pre>

    
--------------
Copyright (c) 2015 Luscus (luscus.redbeard@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
