/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

/**
 * Inject arguments and call function.
 * @param {string} sourceDir
 * @param {function|[function]} getters
 * @param {[[string|function]|string|function]|function} args
 * @returns {function}
 */
module.exports = function(sourceDir, getters, ...args) {

  if (!Array.isArray(getters)) {
    getters = [ getters ];
  }

  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  let func = args.pop(), argList;

  if (typeof(func) !== 'function') {
    throw new Error('function to be call is required');
  }

  if (args.length === 0 && (argList = (func + '').toString().match(/^(async )?(function )?\((.+?)\)/))) {
    args = argList[3].split(/,\s*/g);
  }

  args.forEach((arg, index) => {

    getters.every(getter => {
      return !(args[index] = getter(arg));
    });

    if (!args[index]) {
      throw new Error(`cannot inject argument ${arg.bold} in source ${sourceDir.bold}`.red); // TODO
    }

  });

  return (...rest) => {
    return func.apply(this, Object.assign(args, rest));
  };

};
