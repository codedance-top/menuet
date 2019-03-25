/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

module.exports = {

  /**
   * Rename object's properties.
   */
  renameProperties: {
    type: 'object',
    modifying: true,
    errors: false,
    compile: function(arg0, schema) {
      const alias = schema.renameProperties;
      return function(value) {
        value && Object.keys(alias).forEach(propertyName => {
          if (typeof (value[propertyName]) === 'undefined') {
            return;
          }
          value[alias[propertyName]] = value[propertyName];
          delete value[propertyName];
        });
        return true;
      };
    }
  }

};
