/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const path = require('path');
const promisify = require('./promisify');
const readDir = promisify.fs.readDir;
const isDirectory = promisify.fs.isDirectory;

/**
 * Require modules under specified directory.
 * @param {string} dir
 * @param {function} onRequired
 * @param {object} options
 * @param {[string]} [parents]
 * @returns {Promise}
 */
const requireDir = async (dir, onRequired, options, parents) => {

  parents = parents || [];

  let files = await readDir(dir), filename, filepath, extName, moduleName;

  while (filename = files.shift()) {

    filepath = path.join(dir, filename);
    extName = path.extname(filename);
    moduleName = filename.slice(0, filename.lastIndexOf(extName));

    if (options.ignoreHiddenFiles && filename[0] === '.') {
      continue;
    }

    // require modules under subdirectory
    if (await isDirectory(filepath)) {
      await requireDir(filepath, onRequired, options, parents.concat(moduleName));
    // require module
    } else if (options.acceptExtNames.indexOf(extName) >= 0) {
      onRequired(require(filepath), parents.concat(moduleName).join('/'), filepath);
      delete require.cache[require.resolve(filepath)];
    }

  }

};

/**
 * Require modules in directory.
 * @param {string} dir
 * @param {object|function|string|[string]} [options]
 * @param {boolean} [options.ignoreHiddenFiles]
 * @param {[string]} [options.acceptExtNames]
 * @param {function} onRequired
 * @returns {Promise}
 */
module.exports = async (dir, options, onRequired) => {

  if (typeof(options) === 'function') {
    onRequired = options;
    options = {};
  } else if (typeof(options) === 'string') {
    options = { acceptExtNames: [ options ] };
  } else if (Array.isArray(options)) {
    options = { acceptExtNames: options };
  }

  options = Object.assign({
    ignoreHiddenFiles: true,
    acceptExtNames: [ '.js', '.json', '.node' ]
  }, options);

  return await requireDir(dir, onRequired, options);
};
