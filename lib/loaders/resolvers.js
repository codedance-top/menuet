/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const injectArgs = require('../../utils/inject-args');

const DEFAULT_RESOLVER = Symbol.for('defaultResolver');
const ERROR_RESOLVER = Symbol.for('errorResolver');
const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const GET_UTIL = Symbol.for('getUtil');
const GET_SERVICE = Symbol.for('getService');

/**
 * Load response resolvers.
 * @param {object} app
 * @param {object} paths
 * @param {string} paths.defaultResolver
 * @param {string} paths.errorResolver
 * @returns {Promise}
 */
module.exports = async (app, paths) => {

  const getters = [
    (name) => {
      return ({
        res: {},
        data: {},
        error: {},
        $config: app[CONFIG],
        $string: app[GET_STRING],
        $utils: require('../../utils')
      })[name];
    },
    app[GET_SERVICE],
    app[GET_UTIL]
  ];

  /**
   * Load resolver.
   * @param {Symbol} symbol
   * @param {string} dir
   */
  const loadResolver = (symbol, dir) => {

    let resolver;

    try {
      resolver = require(dir);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        return;
      }
    }

    if (typeof(resolver) !== 'function') {
      throw new Error('resolver must be a function');
    }

    app[symbol] = injectArgs.call(app, dir, getters, resolver);
  };

  loadResolver(DEFAULT_RESOLVER, paths.defaultResolver);

  app[DEFAULT_RESOLVER] = app[DEFAULT_RESOLVER] || ((res, data) => {
    return data;
  });

  loadResolver(ERROR_RESOLVER, paths.errorResolver);

  app[ERROR_RESOLVER] = app[ERROR_RESOLVER] || ((res, error) => {
    return error;
  });

};
