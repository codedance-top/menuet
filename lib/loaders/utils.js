/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const requireDir = require('../../utils/require-dir');
const camelCase = require('../../utils/string').camel;
const injectArgs = require('../../utils/inject-args');

const GET_UTIL = Symbol.for('getUtil');
const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const VALIDATE_MODULE_NAME = Symbol.for('validateModuleName');
const MODULE_NAME = Symbol.for('moduleName');

/**
 * Load utilities.
 * @param {object} app
 * @param {string} utilsDir
 * @returns {Promise}
 */
module.exports = async (app, utilsDir) => {

  let utils = {}, moduleName;

  /**
   * Get utility by name.
   * @param {string} utilName
   * @returns {object|function}
   */
  app[GET_UTIL] = (utilName) => {
    return utils[utilName];
  };

  if (!utilsDir) {
    return;
  }

  const getters = [
    (name) => {
      return ({
        $config: app[CONFIG],
        $string: app[GET_STRING],
        $utils: require('../../utils')
      })[name];
    },
    app[GET_UTIL]
  ];

  await requireDir(utilsDir, [ '.js', '.json' ], (define, name, sourceDir) => {

    moduleName = define[MODULE_NAME] || `${camelCase(name, true)}Util`;
    app[VALIDATE_MODULE_NAME](moduleName);

    if (typeof(define) === 'function') {
      utils[moduleName] = injectArgs.call(app, sourceDir, getters, define)();
    } else {
      utils[moduleName] = define;
    }

  });

};
