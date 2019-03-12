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

// use native Promise, see: http://mongoosejs.com/docs/promises.html
mongoose.Promise = Promise;

// see: https://mongoosejs.com/docs/deprecations
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

/**
 * Connect MongoDB and load models.
 * @param {object} app
 * @param {object} mongoConfig
 * @returns {Promise}
 */
exports.connect = async (app, mongoConfig) => {

  if (!mongoConfig) {
    return;
  }

  // connect MongoDB server
  await mongoose.connect(mongoConfig.url);

  const setOptions = mongoose.Query.prototype.setOptions;

  /**
   * Overwrite setOptions method and make lean as default.
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
};
