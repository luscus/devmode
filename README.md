# devmode
[![NPM version](https://img.shields.io/npm/v/devmode.svg?style=flat)](https://www.npmjs.com/package/devmode "View this project on NPM")
[![NPM downloads](https://img.shields.io/npm/dm/devmode.svg?style=flat)](https://www.npmjs.com/package/devmode "View this project on NPM")
[![NPM license](https://img.shields.io/npm/l/devmode.svg?style=flat)](https://www.npmjs.com/package/devmode "View this project on NPM")
[![flattr](https://img.shields.io/badge/flattr-donate-yellow.svg?style=flat)](http://flattr.com/thing/3817419/luscus-on-GitHub)

![coverage](https://cdn.rawgit.com/luscus/devmode/master/reports/coverage.svg)
[![David](https://img.shields.io/david/luscus/devmode.svg?style=flat)](https://david-dm.org/luscus/devmode)
[![David](https://img.shields.io/david/dev/luscus/devmode.svg?style=flat)](https://david-dm.org/luscus/devmode#info=devDependencies)

Wrapper for the node binary. As known from similar wrapper like [nodemon](https://www.npmjs.com/package/nodemon) it will
start a script and restart it on code changes in order to facilitate development.

The unique feature of this wrapper is that it will also watch any script dependency found in the same working directory,
allowing the same benefit as with `npm link` for parallele package development.

## Installation

    npm install -g devmode
    
## Usage

    devmode path/to/script

### Node "require" Wrapper
A wrapper for the native Node.js [Module.prototype.require](https://nodejs.org/dist/latest-v4.x/docs/api/modules.html#modules_module_require_id) method.
This wrapper has been inspired by Gleb Bahmutov excellent article
[Hacking Node require](http://bahmutov.calepin.co/hacking-node-require.html) and the resulting package [really-need](https://github.com/bahmutov/really-need)

When started with `devmode` each dependency packages will be loaded
from the `workplace directory` (if found) or as usual from the `node_modules`.
This is true for every package found in the process: dependencies from dependencies from your script

<pre>
   WORKPLACE
      |_ YourProject
      |    |_ someLib.js          (watched)
      |    |_ otherLib.js         (watched)
      |    |_ index.js            (started and watched)
      |    |_ node_modules
      |         |_ dependency.1   (loaded from workplace)
      |         |_ dependency.2
      |         |_ dependency.3   (loaded from workplace)
      |    
      |_ dependency.1             (loaded)
      |    |_ data.json           (watched)
      |    |_ index.js            (watched)
      |    |_ node_modules
      |         |_ dependency.n   (loaded from workplace)
      |         |_ dependency.3   (loaded from workplace)
      |
      |_ dependency.3             (loaded)
      |    |_ data.json           (watched)
      |    |_ index.js            (watched)
      |
      |_ dependency.n             (loaded)
           |_ index.js            (watched)
</pre>

## Troubleshooting

### Error: watch ... ENOSPC

This might be because of your system reach out of user can watch files.
you can use the following command line in Debian, Debian based (Ubuntu, Mint) and CentOS

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
    
--------------
Copyright (c) 2015-2016 Luscus (luscus.redbeard@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
