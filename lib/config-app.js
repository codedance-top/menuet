/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const ejs = require('ejs');

const ROUTER = Symbol.for('router');

/**
 * Configure app.
 * @param {object} app
 * @param {object} config
 * @param {object} config.http
 * @param {object} config.http.cookieParser
 * @param {object} config.http.jsonParser
 * @param {object} config.http.urlencodedParser
 * @param {object} [config.http.allowCrossDomainAccess]
 * @param {object} [config.http.compression]
 * @param {object} config.paths
 * @param {string} config.paths.routes
 * @param {string} config.paths.controllers
 * @param {string} config.paths.public
 * @param {string} config.paths.static
 * @returns {Promise.<void>}
 */
module.exports = async (app, config) => {

  const httpServerState = app.httpServerState;

  // update application's state when stopping/restarting
  process.on('SIGINT', function() {

    httpServerState.state = 'init';

    if (httpServerState.requestCount === 0) {
      process.exit(0);
    }

  });

  /**
   * Update HTTP server's state.
   * @param {IncomingMessage} req
   * @param {boolean} req.isRequestResolved
   */
  const updateHttpServerState = (req) => {

    if (!req.isRequestResolved) {

      req.isRequestResolved = true;

      httpServerState.requestCount--;

      if (httpServerState.requestCount < 0) {
        httpServerState.requestCount = 0;
      }

    }

    if (httpServerState.state === 'init'
        && httpServerState.requestCount === 0) {
      process.exit(0);
    }

  };

  // parse request data
  app
    .use(cookieParser(config.http.cookieParser))
    .use(bodyParser.json(config.http.jsonParser))
    .use(bodyParser.urlencoded(config.http.urlencodedParser))
    .use(bodyParser.text())
    .use(bodyParser.raw())
    .use((req, res, next) => {
      res.set({ 'X-Powered-By': 'Menuet' });
      next();
    });

  // set view engine
  if (config.paths.views) {
    app
      .set('views', config.paths.views)
      .set('view engine', 'ejs')
      .engine('html', ejs.renderFile);
  }

  // allow cross domain access (browser only)
  if (config.http.allowCrossDomainAccess) {

    app.use((req, res, next) => {

      if (/^(Mozilla|Opera)\//.test(req.get('user-agent'))) {
        res.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': 'Authorization,X-Requested-With,Content-Type'
        });
      }

      if (req.method === 'OPTIONS') {
        res.end();
        return;
      }

      if (httpServerState.state !== 'ready') {
        res.statusCode = 503;
        res.end();
        return;
      }

      httpServerState.requestCount++;

      req.isRequestResolved = false;

      req.on('abort', () => { updateHttpServerState(req); });
      req.on('timeout', () => { updateHttpServerState(req); });
      res.on('close', () => { updateHttpServerState(req); });
      res.on('finish', () => { updateHttpServerState(req); });

      next();
    });

  }

  // set path of public resources
  if (config.paths.public) {
    app.use(express.static(config.paths.public));
  }

  // set path of staticized resources
  if (config.paths.static) {
    app.use(express.static(config.paths.static));
  }

  // configure router
  if (app[ROUTER]) {
    app.use(express.Router(config.http.router).use(config.http.base, app[ROUTER]));
  }

  // resolve 404 error
  app.use((req, res) => {

    res.status(404);

    if (req.accepts('text/html')) {
      res.render('404');
    } else if (req.accepts('application/json')) {
      res.json({});
    } else {
      res.end();
    }

  });

  // compress response data
  if (config.http.compression) {
    app.use(compression(config.http.compression));
  }

};
