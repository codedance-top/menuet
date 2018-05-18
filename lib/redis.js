/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const redis = require('redis');

/**
 * Connect Redis server.
 * @param {object} app
 * @param {object} config
 * @returns {Promise}
 */
exports.connect = (app, config) => {

  return new Promise((resolve, reject) => {

    if (!config) {
      return resolve();
    }

    let redisClient = redis.createClient(config);

    redisClient.on('error', e => {
      reject(e);
    });

    redisClient.on('connect', () => {
      // TODO: log redis "connect" event
    });

    redisClient.on('ready', () => {
      redis.client = new RedisClientWrapper(redisClient);
      resolve();
    });

  });

};

/**
 * Redis client promisify wrapper.
 * @param {object} redisClient
 * @constructor
 */
class RedisClientWrapper {

  /**
   * Constructor.
   * @param {object} redisClient
   * @param {function} redisClient.set
   * @param {function} redisClient.get
   * @param {function} redisClient.incr
   * @param {function} redisClient.incrby
   * @param {function} redisClient.del
   * @param {function} redisClient.expire
   */
  constructor(redisClient) {
    this.client = redisClient;
  }

  /**
   * Set TTL of key.
   * @param {string} key
   * @param {number} ttl
   * @param {*} [value]
   * @returns {Promise}
   */
  expire(key, ttl, value) {

    return new Promise((resolve, reject) => {

      if (isNaN(ttl)) {
        return resolve(value);
      }

      this.client.expire(key, ttl, (e) => {
        !e ? resolve(value) : reject(e);
      });

    });

  }

  /**
   * Get TTL of key.
   * @param {string} key
   * @returns {Promise.<number>}
   */
  getTTL(key) {

    return new Promise((resolve, reject) => {

      this.client.ttl(key, (e, ttl) => {
        !e ? resolve(ttl) : reject(e);
      });

    });

  }

  /**
   * Get entry.
   * @param {string} key
   * @param {number} [ttl]
   * @param {function} [parser]
   * @returns {Promise}
   */
  get(key, ttl, parser) {

    return (new Promise((resolve, reject) => {
      this.client.get(key, (e, value) => {
        parser && (value = parser(value));
        !e ? resolve(value) : reject(e);
      });
    })).then((value) => {
      return this.expire(key, ttl, value);
    });

  }

  /**
   * Get number entry.
   * @param {string} key
   * @param {number} [ttl]
   * @returns {Promise}
   */
  getNumber(key, ttl) {
    return this.get(key, ttl, parseFloat);
  }

  /**
   * Set value of key.
   * @param {string} key
   * @param {*} value
   * @param {number} [ttl]
   * @returns {Promise}
   */
  set(key, value, ttl) {

    return (new Promise((resolve, reject) => {
      this.client.set(key, value, (e) => {
        !e ? resolve() : reject(e);
      });
    })).then(() => {
      return this.expire(key, ttl);
    });

  }

  /**
   * Increase value of key.
   * @param {string} key
   * @param {number} increment
   * @param {number} [ttl]
   * @returns {Promise.<number>}
   */
  incr(key, increment, ttl) {

    return (new Promise((resolve, reject) => {
      this.client.incrby(key, increment || 1, (e, number) => {
        !e ? resolve(number) : reject(e);
      });
    })).then(number => {
      return this.expire(key, ttl, number);
    });

  }

  /**
   * Delete key.
   * @param {string} key
   * @returns {Promise.<void>}
   */
  del(key) {

    return new Promise((resolve, reject) => {
      this.client.del(key, e => {
        !e ? resolve() : reject(e);
      });
    });

  }

}
