/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = mongoose.Types;
const ObjectId = mongoose.Types.ObjectId;
const redis = require('redis');

const requireDir = require('../../utils/require-dir');
const injectArgs = require('../../utils/inject-args');
const camelCase = require('../../utils/string').camel;

const MODEL_MODIFIED = Symbol.for('isModelModified');
const MODEL_MODIFIED_PROPERTIES = Symbol.for('modifiedProperties');
const GET_MODEL = Symbol.for('getModel');
const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');
const GET_UTIL = Symbol.for('getUtil');
const VALIDATE_MODULE_NAME = Symbol.for('validateModuleName');
const MODULE_NAME = Symbol.for('moduleName');

/**
 * Merge model with object.
 * @param {Object} object
 * @returns {mongoose.Model}
 */
mongoose.Model.prototype.merge = function(object) {

  if (Object.prototype.toString.call(object) !== '[object Object]') {
    return this;
  }

  Object.keys(object).forEach(key => {
    if (Object.prototype.toString.call(object[key]) !== '[object Object]'
        || !key.match(/^([_\-0-9a-z]+)\.([0-9]+)$/i)) {
      return;
    }
    Object.keys(object[key]).forEach(propertyName => {
      object[`${key}.${propertyName}`] = object[key][propertyName];
    });
    delete object[key];
  });

  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'undefined'
      || this.get(key) === object[key]
      || JSON.stringify(this.get(key)) === JSON.stringify(object[key])) {
      return;
    }
    this.set(key, object[key]);
    this[MODEL_MODIFIED_PROPERTIES] = this[MODEL_MODIFIED_PROPERTIES] || {};
    this[MODEL_MODIFIED_PROPERTIES][key] = object[key];
    this[MODEL_MODIFIED] = true;
  });

  return this;
};

/**
 * If the model is modified.
 * @returns {boolean}
 */
mongoose.Model.prototype.isModified = function() {
  return this[MODEL_MODIFIED] === true;
};

/**
 * Get modified properties.
 * @returns {Object}
 */
mongoose.Model.prototype.getModifiedProperties = function() {
  return this[MODEL_MODIFIED_PROPERTIES];
};

/**
 * Load models.
 * @param {object} app
 * @param {string} modelsDir
 * @returns {Promise}
 */
module.exports = async (app, modelsDir) => {

  let models = {};

  /**
   * Get model by name.
   * @param {string} modelName
   * @returns {mongoose.Model}
   */
  app[GET_MODEL] = (modelName) => {
    return models[modelName];
  };

  if (!modelsDir) {
    return;
  }

  const getters = [
    (name) => {
      return ({
        Schema: Schema,
        ObjectId: ObjectId,
        Types: Types,
        $redis: redis.client,
        $config: app[CONFIG],
        $string: app[GET_STRING],
        $utils: require('../../utils')
      })[name];
    },
    app[GET_UTIL]
  ];

  await requireDir(modelsDir, '.js', (define, name, sourceDir) => {

    let moduleName = define[MODULE_NAME] || `${camelCase(name, true)}Model`;

    app[VALIDATE_MODULE_NAME](moduleName);

    let model = injectArgs.call(app, sourceDir, getters, define)();

    models[moduleName] = model.constructor === mongoose.Schema ? mongoose.model(moduleName, model) : model;
  });

};
