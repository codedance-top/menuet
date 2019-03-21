/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

/**
 * Deep assign.
 * @param {object} target
 * @param {object} sources
 * @returns {object}
 */
const deepAssign = module.exports = (target, ... sources) => {

  sources.forEach(source => {
    Object.keys(source).forEach(key => {

      const sourceValueType = typeof(source[key]);

      if (sourceValueType === 'undefined') {
        return;
      }

      const targetValueType = typeof(target[key]);

      if (Array.isArray(target[key])
          || Array.isArray(source[key])
          || !(targetValueType === 'object' && sourceValueType === 'object')) {
        target[key] = source[key];
      } else {

        target[key] = deepAssign(target[key], source[key]);

        if (key === '$enum' && Array.isArray(target['enum'])) {
          Object.keys(target['$enum']).forEach(value => {
            if (target['enum'].indexOf(value) < 0) {
              delete target['$enum'][value];
            }
          });
        }
      }
    });
  });

  return target;
};
