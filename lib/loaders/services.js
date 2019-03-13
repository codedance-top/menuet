/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const requireDir = require('../../utils/require-dir');
const camelCase = require('../../utils/string').camel;
const injectArgs = require('../../utils/inject-args');

const GET_SERVICE = Symbol.for('getService');
const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const GET_UTIL = Symbol.for('getUtil');
const GET_MODEL = Symbol.for('getModel');
const VALIDATE_MODULE_NAME = Symbol.for('validateModuleName');
const MODULE_NAME = Symbol.for('moduleName');

/**
 * Load services.
 * @param {object} app
 * @param {string} servicesDir
 * @returns {Promise}
 */
module.exports = async (app, servicesDir) => {

  let services = {}, moduleName;

  /**
   * Get service by name.
   * @param {string} serviceName
   * @returns {object|function}
   */
  app[GET_SERVICE] = serviceName => services[serviceName];

  if (!servicesDir) {
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
    app[GET_UTIL],
    app[GET_MODEL]
  ];

  await requireDir(servicesDir, '.js', (define, name, sourceDir) => {
    moduleName = define[MODULE_NAME] || `${camelCase(name, true)}Service`;
    app[VALIDATE_MODULE_NAME](moduleName);
    services[moduleName] = injectArgs.call(app, sourceDir, getters, define)();
  });

};
