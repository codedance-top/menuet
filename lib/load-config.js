/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const path = require('path');
const fs = require('fs');
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

  let config = {};
  let configFilePath = path.join(dir, process.env.NODE_ENV);

  // load configuration files in environment directory
  if (fs.existsSync(configFilePath) && fs.statSync(configFilePath).isDirectory()) {
    fs.readdirSync(configFilePath).forEach(filename => {
      config[filename.replace(/\.\w+$/, '')] = require(path.join(configFilePath, filename));
    });
  // load single configuration file
  } else if (fs.existsSync(configFilePath = `${configFilePath}.json`)
      || fs.existsSync(configFilePath = `${configFilePath}.js`)) {
    config = require(configFilePath);
  }

  // load source path configuration
  if (fs.existsSync(configFilePath = path.join(dir, 'paths.json'))
      || fs.existsSync(configFilePath = path.join(dir, 'paths.js'))) {
    config.paths = require(configFilePath);
  }

  // set default configurations
  config = deepAssign(defaultConfig, config);

  setMongoURL(config.mongo);

  const baseDir = config.paths['base'] || '/';

  Object.keys(config.paths).forEach(key => {
    if (key === 'base') {
      return;
    }
    config.paths[key] = path.join(
      process.env.PWD,
      config.paths[key].startsWith('/') ? '/' : baseDir,
      config.paths[key]
    );
  });

  return deepFreeze(config);
};
