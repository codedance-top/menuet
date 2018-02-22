/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

/**
 * Deep clone.
 * @param {object} object
 * @returns {object}
 */
exports = module.exports = object => {

  Object.keys(object).forEach(key => {
    if (typeof(object[key]) === 'object') {
      object[key] = exports(object[key]);
    }
  });

  return Object.freeze(object);
};
