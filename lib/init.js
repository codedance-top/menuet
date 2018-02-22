/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const injectArgs = require('../utils/inject-args');

const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const GET_UTIL = Symbol.for('getUtil');
const GET_SERVICE = Symbol.for('getService');

/**
 * Initialize app.
 * @param {object} app
 * @param {string} initializerPath
 * @returns {Promise.<void>}
 */
module.exports = async (app, initializerPath) => {

  let init = null;

  try {
    init = require(initializerPath);
  } catch(e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  if (typeof(init) !== 'function') {
    return;
  }

  const getters = [
    (name) => {
      return ({
        $config: app[CONFIG],
        $string: app[GET_STRING]
      })[name];
    },
    app[GET_SERVICE],
    app[GET_UTIL]
  ];

  await injectArgs.call(app, initializerPath, getters, init)();
};
