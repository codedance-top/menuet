/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const path = require('path');
const AJV = require('ajv');
const ajvKeywords = require('ajv-keywords');
const jsonSchemaDraft06 = require('ajv/lib/refs/json-schema-draft-06');
const requireDir = require('../../utils/require-dir');

const AJV_INSTANCE = Symbol.for('ajv');
const SCHEMA_VALIDATORS = Symbol.for('schema-validators');

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

  let ajv = app[AJV_INSTANCE] = ajvKeywords(new AJV({
    $data: true,
    schemaId: '$id',
    async: 'es7',
    coerceTypes: true,
    useDefaults: true,
    allErrors: true,
    removeAdditional: 'all'
  }), null);

  ajv.addMetaSchema(jsonSchemaDraft06);

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
  await requireDir(schemasDir, '.json', (schema, name) => {
    schema.$id = schema.$id || schema.id;
    schema.$schema = schema.$schema || 'http://json-schema.org/draft-07/schema#';
    schema.$async = true;
    ajv.addSchema(schema, name);
  });

};
