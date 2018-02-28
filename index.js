#!/usr/bin/env node
/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

require('colors');
const path = require('path');
const express = require('express');

const loadConfig = require('./lib/load-config');
const redis = require('./lib/redis');
const mongo = require('./lib/mongo');
const loaders = require('./lib/loaders');
const init = require('./lib/init');
const configApp = require('./lib/config-app');
const createHttpServer = require('./lib/http-server').create;

const CONFIG = Symbol.for('config');
const VALIDATE_MODULE_NAME = Symbol.for('validateModuleName');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = module.exports = express();

app.httpServerState = {
  state: 'pending',
  requestCount: 0
};

const config = app[CONFIG] = loadConfig(path.join(process.env.PWD, 'config'), require('./config/default.json'));

// define module name validator
(function() {

  // declare module name list and initialize it with reserved module names
  let moduleNames = [
    'req',
    'res',
    'data',
    'error',
    'context',
    'Schema',
    'ObjectId',
    '$config',
    '$string',
    '$redis',
    '$utils'
  ];

  /**
   * Validate module names.
   * @param {string} moduleName
   */
  app[VALIDATE_MODULE_NAME] = moduleName => {

    if (moduleNames.indexOf(moduleName) >= 0) {
      throw new Error(`duplicate module with name ${moduleName.bold} already registered.`.red); // TODO
    }

    moduleNames.push(moduleName);
  };

})();

// load modules and create HTTP server
(async function() {

  await loaders.strings(app, config.paths.strings);

  await redis.connect(app, config.redis);
  await mongo.connect(app, config.mongo);

  await loaders.validators(app, config.paths.schemas);
  await loaders.utils(app, config.paths.utils);
  await loaders.models(app, config.paths.models);
  await loaders.services(app, config.paths.services);
  await loaders.interceptors(app, config.paths.interceptors);
  await loaders.controllers(app, config.paths.controllers);
  await loaders.resolvers(app, config.paths);
  await loaders.routes(app, config.paths.routes);

  await init(app, config.paths.init);

  await configApp(app, config);

  await createHttpServer(app, config.http);

})()
  .then(() => {
    app.httpServerState.state = 'ready';
    console.log(`HTTP server started, port: ${('' + config.http.port).yellow}`.green);
  })
  .catch(e => {
    app.httpServerState.state = 'error';
    console.error(e);
  });
