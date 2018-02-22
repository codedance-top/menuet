/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const APPLICATION = Symbol.for('application');
const REQUEST = Symbol.for('request');
const RESPONSE = Symbol.for('response');
const ACCESS_TOKEN = Symbol.for('x-access-token');
const USER_INFO = Symbol.for('x-user-info');
const IPV4_REGEXP = /^((0000:0000:0000:0000:0000|:):ffff:)?(\d+\.\d+\.\d+\.\d+)$/i;

/**
 * Get remote address from request.
 * @param {IncomingMessage} req
 * @param {object} req.socket
 * @param {string} req.socket.remoteAddress
 * @param {object} req.connection
 * @param {object} req.connection.socket
 * @param {string} req.connection.socket.remoteAddress
 * @param {string} req.connection.remoteAddress
 * @returns {string}
 */
const getRemoteAddress = (req) => {

  let remoteAddress = req.get('x-forwarded-for')
    || req.get('x-real-ip')
    || (req.socket || {}).remoteAddress
    || (req.connection.socket || {}).remoteAddress
    || req.connection.remoteAddress;

  remoteAddress = (remoteAddress.match(IPV4_REGEXP) || [])[3] || remoteAddress;

  return remoteAddress;
};

/**
 * Context class.
 */
class Context {

  /**
   * Constructor.
   * @param {object} app
   * @param {IncomingMessage} req
   * @param {object} req.headers
   * @param {object} req.cookies
   * @param {object} req.query
   * @param {object} req.params
   * @param {object} req.body
   * @param {string} req.method
   * @param {ServerResponse} res
   */
  constructor(app, req, res) {
    this[APPLICATION] = app;
    this[REQUEST] = req;
    this[RESPONSE] = res;
    this.accessToken = req[ACCESS_TOKEN];
    this.user = req[USER_INFO];
    this.userAgent = req.get('user-agent');
    this.url = req.url;
    this.referrer = req.get('referer');
    this.remoteAddr = getRemoteAddress(req);
    this.headers = req.headers || {};
    this.cookies = req.cookies || {};
    this.query = req.query || {};
    this.params = req.params || {};
    this.body = req.body || {};
    this.method = req.method;
  }

  /**
   * Get HTTP request header field.
   * @param {string} field
   * @returns {string}
   */
  get(field) {
    return this[REQUEST].get(field);
  }

  /**
   * Set cookie.
   * @param {string} key
   * @param {string} value
   * @param {object} [options]
   */
  cookie(key, value, options) {
    this[RESPONSE].cookie(key, value, options);
    return this;
  }

}

module.exports = Context;
