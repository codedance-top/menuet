/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const requireDir = require('../../utils/require-dir');
const injectArgs = require('../../utils/inject-args');

const INTERCEPTORS = Symbol.for('interceptors');
const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const GET_UTIL = Symbol.for('getUtil');
const GET_SERVICE = Symbol.for('getService');

/**
 * Load request interceptors.
 * @param {object} app
 * @param {string} interceptorsDir
 * @returns {Promise}
 */
module.exports = async (app, interceptorsDir) => {

  let interceptors = app[INTERCEPTORS] = {};

  if (!interceptorsDir) {
    return;
  }

  const getters = [
    (name) => {
      return ({
        req: {},
        options: {},
        $config: app[CONFIG],
        $string: app[GET_STRING],
        $utils: require('../../utils')
      })[name];
    },
    app[GET_SERVICE],
    app[GET_UTIL]
  ];

  await requireDir(interceptorsDir, '.js', (interceptor, name, sourceDir) => {
    if (typeof(interceptor) === 'function') {
      interceptors[name] = injectArgs.call(app, sourceDir, getters, interceptor);
    } else {
      throw new Error(`interceptor '${name}' must be a function`);
    }
  });

};
