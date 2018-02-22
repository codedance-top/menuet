/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

/**
 * Deep assign.
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
exports = module.exports = (target, source) => {

  Object.keys(source).forEach(key => {

    if (!Array.isArray(target[key])) {
      if (typeof(target[key]) === 'object' && typeof(source[key]) === 'object') {
        target[key] = exports(target[key], source[key]);
      } else if (typeof(source[key]) !== 'undefined') {
        target[key] = source[key];
      }
    }

  });

  return target;
};
