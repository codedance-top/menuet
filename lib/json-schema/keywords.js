/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

module.exports = {

  /**
   * Keyword for validating number's inclusive range.
   */
  range: {
    type: [ 'number', 'integer' ],
    validate: (range, data) => {
      return data >= range[0] && data <= range[1];
    },
    metaSchema: {
      type: 'array',
      items: [
        { type: 'number' },
        { type: 'number' }
      ],
      additionalItems: false
    }
  }

};
