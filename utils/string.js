/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

/**
 * Camel case.
 * @param {string} string
 * @param {boolean} [capitalisation=false]
 * @returns {string}
 */
exports.camel = (string, capitalisation) => {

  if (/[A-Z]/.test(string)) {
    return string;
  }

  string = string
    .toLowerCase()
    .replace(/([0-9a-z])?[^0-9a-z]+([a-z])/gi, (matched, $1, $2, index) => {
      return (!$1 && index === 0) ? matched : (($1 || '') + $2.toUpperCase());
    });

  if (capitalisation) {
    string = string
      .replace(/^([a-z])/g, (matched, $1) => {
        return $1.toUpperCase();
      });
  }

  return string;
};

/**
 * Snake case.
 * @param {string} string
 * @param {string} [separator=_]
 * @returns {string}
 */
exports.snake = (string, separator) => {

  separator = separator || '_';

  return string
    .replace(/[^0-9a-z]+/gi, separator)
    .replace(/[A-Z]/g, (matched) => {
      return separator + matched.toLowerCase();
    })
    .replace(new RegExp(separator + '+', 'g'), separator);

};

/**
 * Kebab case.
 * @param {string} string
 * @returns {string}
 */
exports.kebab = (string) => {
  return exports.snake(string, '-');
};
