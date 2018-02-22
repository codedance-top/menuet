/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const http = require('http');

/**
 * Create and start HTTP server.
 * @param {object} app
 * @param {object} httpConfig
 * @returns {Promise}
 */
exports.create = (app, httpConfig) => {

  return new Promise((resolve, reject) => {

    let server = http.createServer(app);

    server.listen(httpConfig.port, (e) => {

      if (e) {
        return reject(e);
      }

      app.server = server;

      resolve();
    });

  });

};
