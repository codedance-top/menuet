/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const requireDir = require('../../utils/require-dir');
const kebabCase = require('../../utils/string').kebab;

const CONFIG = Symbol.for('config');
const GET_STRING = Symbol.for('getString');

/**
 * Load strings.
 * @param {object} app
 * @param {string} stringsDir
 * @returns {Promise}
 */
module.exports = async (app, stringsDir) => {

  let strings = {};
  let defaultLanguage = kebabCase(app[CONFIG].defaults.language.toLowerCase());
  let replacements = {};

  /**
   * Get string and set parameters.
   * @param {object} req
   * @param {string} code
   * @param {string|[string]} [params]
   */
  app[GET_STRING] = (req, code, params) => {

    let language = kebabCase((
      (req.query || {})['lang']
      || (req.cookies || {})['accept-language']
      || ((req.headers || {})['accept-language'] || '').split(',')[0]
      || ''
    ).toLowerCase());

    let string = (strings[language] || strings['default'] || {})[code] || code;

    if (params) {

      if (!Array.isArray(params)) {
        params = [ params ];
      }

      params.forEach((param, index) => {
        string = string.replace(
          replacements[index] || (replacements[index] = new RegExp(`\\{${index}\\}`, 'g')),
          (typeof(param) === 'string' ? app[GET_STRING](req, param) : param) || param
        );
      });

    }

    return string;
  };

  if (!stringsDir) {
    return;
  }

  try {

    await requireDir(stringsDir, [ '.json' ], (dict, language) => {

      language = kebabCase(language.toLowerCase());

      strings[language] = dict;

      if (!strings['default'] || defaultLanguage === language) {
        strings['default'] = dict;
      }

    });

  } catch (e) {

    if (e.code !== 'ENOENT') {
      throw e;
    }

  }

};
