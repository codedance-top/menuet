/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const fs = require('fs');

/**
 * Promisify a function.
 * @param {function} func
 * @returns {function}
 */
const promisify = module.exports = (func) => {

  return (...rest) => {

    return new Promise((resolve, reject) => {

      rest.push((e, result) => {
        !e ? resolve(result) : reject(e);
      });

      func(...rest);
    });

  };

};

// File system namespace
promisify.fs = {};

/**
 * Read directory.
 * @param {string} path
 * @returns {Promise}
 */
promisify.fs.readDir = promisify(fs.readdir);

/**
 * Get file's stats.
 * @param {string} path
 * @returns {Promise}
 */
promisify.fs.getFileStats = promisify(fs.stat);

/**
 * Check if a file is a directory.
 * @param {string} path
 * @returns {Promise}
 */
promisify.fs.isDirectory = (path) => {

  return new Promise((resolve, reject) => {

    promisify.fs.getFileStats(path)
      .then(stats => {
        resolve(stats.isDirectory());
      })
      .catch(e => {
        reject(e);
      });

  });

};
