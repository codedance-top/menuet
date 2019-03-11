/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const path = require('path');
const AJV = require('ajv');
const requireDir = require('../../utils/require-dir');

const AJV_INSTANCE = Symbol.for('ajv');
const SCHEMA_VALIDATORS = Symbol.for('schema-validators');

require('ajv-keywords')(AJV);

let keywords = require('../json-schema/keywords');
let formats = require('../json-schema/formats');

/**
 * Load form schemas.
 * @param {object} app
 * @param {string} schemasDir
 * @returns {Promise.<void>}
 */
module.exports = async (app, schemasDir) => {

  app[SCHEMA_VALIDATORS] = {};

  let ajv = app[AJV_INSTANCE] = new AJV({
    async: 'es7',
    coerceTypes: true,
    useDefaults: true,
    allErrors: true,
    removeAdditional: 'all'
  });

  // load custom keywords
  try {
    Object.assign(keywords, require(path.join(schemasDir, 'keywords.js')));
  } catch (e) {
    void(0);
  }

  // add custom keywords, see https://github.com/epoberezkin/ajv#defining-custom-keywords
  Object.keys(keywords).forEach(keyword => {
    ajv.addKeyword(keyword, keywords[keyword]);
  });

  // load custom formats
  try {
    Object.assign(formats, require(path.join(schemasDir, 'formats.js')));
  } catch (e) {
    void(0);
  }

  // add custom formats, see https://github.com/epoberezkin/ajv#api-addformat
  Object.keys(formats).forEach(name => {
    ajv.addFormat(name, formats[name]);
  });

  // load JSON schemas
  await requireDir(schemasDir, '.json', (define, name) => {
    define.$async = true;
    ajv.addSchema(define, name);
  });

};
