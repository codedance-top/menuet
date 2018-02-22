/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const path = require('path');
const deepAssign = require('../utils/deep-assign');
const deepFreeze = require('../utils/deep-freeze');

/**
 * Set MongoDB connection URL.
 * @param {object} mongoConfig
 * @param {string} [mongoConfig.username]
 * @param {string} [mongoConfig.password]
 * @param {string} [mongoConfig.host]
 * @param {number} [mongoConfig.port]
 * @param {[object]} [mongoConfig.hosts]
 * @param {string} [mongoConfig.hosts.host]
 * @param {number} [mongoConfig.hosts.port]
 * @param {string} [mongoConfig.db]
 * @param {string} [mongoConfig.replicaSet]
 * @param {string} [mongoConfig.url]
 */
const setMongoURL = mongoConfig => {

  if (!mongoConfig) {
    return;
  }

  let host = (mongoConfig.host && `${mongoConfig.host}:${mongoConfig.port}`) || mongoConfig.hosts.map((host) => { return `${host.host}:${host.port}`; }).join(',');
  let options = mongoConfig.replicaSet ? `?replicaSet=${mongoConfig.replicaSet}&wtimeoutMS=0&readPreference=secondaryPreferred` : '';
  let credentials = '';

  if (mongoConfig.username && mongoConfig.password) {
    credentials += `${mongoConfig.username}:${mongoConfig.password}@`;
  }

  mongoConfig.url = `mongodb://${credentials}${host}/${mongoConfig.db}` + options;
};

/**
 * Load configuration.
 * @param {string} dir
 * @param {object} defaultConfig
 * @returns {{
 *   http: Object,
 *   paths: Object,
 *   mongo: Object,
 *   redis: Object
 * }}
 */
module.exports = (dir, defaultConfig) => {

  /**
   * @type {{
   *   http: object,
   *   paths: object,
   *   mongo: object,
   *   redis: object
   * }}
   */
  let config = require(path.join(dir, `${process.env.NODE_ENV}.json`));

  try {
    config.paths = require(path.join(dir, 'paths.json'));
  } catch (e) {
    void(0);
  }

  // set default configurations
  config = deepAssign(defaultConfig, config);

  setMongoURL(config.mongo);

  Object.keys(config.paths).forEach(key => {
    config.paths[key] = path.join(process.env.PWD, config.paths[key]);
  });

  return deepFreeze(config);
};
