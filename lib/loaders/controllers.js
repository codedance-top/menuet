/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const requireDir = require('../../utils/require-dir');
const injectArgs = require('../../utils/inject-args');

const GET_CONTROLLER = Symbol.for('getController');
const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const GET_UTIL = Symbol.for('getUtil');
const GET_SERVICE = Symbol.for('getService');

/**
 * Load controllers.
 * @param {object} app
 * @param {string} controllersDir
 * @returns {Promise}
 */
module.exports = async (app, controllersDir) => {

  let controllers = {};

  /**
   * Get controller by name.
   * @param {string} controllerName
   * @returns {function}
   */
  app[GET_CONTROLLER] = (controllerName) => {
    return controllers[controllerName];
  };

  if (!controllersDir) {
    return;
  }

  const getters = [
    (name) => {
      return ({
        context: {},
        $config: app[CONFIG],
        $string: app[GET_STRING],
        $utils: require('../../utils')
      })[name];
    },
    app[GET_SERVICE],
    app[GET_UTIL]
  ];

  await requireDir(controllersDir, '.js', (controller, name, sourceDir) => {

    if (typeof(controller) === 'function') {
      controllers[name] = injectArgs.call(app, sourceDir, getters, controller);
    }

    Object.keys(controller).forEach((key) => {
      if (typeof(controller[key]) === 'function') {
        controllers[`${name}.${key}`] = injectArgs.call(app, sourceDir, getters, controller[key]);
      }
    });

  });

};
