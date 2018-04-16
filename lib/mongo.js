/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const mongoose = require('mongoose');

// mongoose function support
require('mongoose-function')(mongoose, { toFunction: functionConverter });

const convertFunction = mongoose.Types.Function.toFunction;

/**
 * Convert string to function.
 * @returns {function}
 */
function functionConverter() {
  return convertFunction.apply(undefined, arguments);
}

/**
 * Connect MongoDB and load models.
 * @param {object} app
 * @param {object} mongoConfig
 * @returns {Promise}
 */
exports.connect = (app, mongoConfig) => {

  return new Promise((resolve, reject) => {

    if (!mongoConfig) {
      return resolve();
    }

    // use native Promise, see: http://mongoosejs.com/docs/promises.html
    mongoose.Promise = Promise;

    // connect MongoDB server
    mongoose.connect(mongoConfig.url, { useMongoClient: true, promiseLibrary: Promise }, e => {

      if (e) {
        return reject(e);
      }

      resolve();
    });

    const setOptions = mongoose.Query.prototype.setOptions;

    /**
     * overwrite setOptions method and make lean as default.
     * @param {object} options
     * @param {boolean} overwrite
     * @returns {mongoose.Query}
     */
    mongoose.Query.prototype.setOptions = function(options, overwrite) {

      setOptions.apply(this, arguments);

      if (typeof(this.options.lean) !== 'boolean') {
        this.options.lean = true;
      }

      return this;
    };

  });

};
