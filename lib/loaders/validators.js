/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const path = require('path');
const readFile = require('fs').readFileSync;
const AJV = require('ajv');
const ajvKeywords = require('ajv-keywords');
const ajvMergePatch = require('ajv-merge-patch');
const jsonSchemaDraft06 = require('ajv/lib/refs/json-schema-draft-06');
const omit = require('lodash/omit');
const requireDir = require('../../utils/require-dir');
const deepAssign = require('../../utils/deep-assign');

const AJV_INSTANCE = Symbol.for('ajv');
const SCHEMA_VALIDATORS = Symbol.for('schema-validators');

const keywords = require('../json-schema/keywords');
const formats = require('../json-schema/formats');

/**
 * Set default keywords.
 * @param {Object} schema
 * @param {String|[String|null]} [schema.type]
 * @param {Object} [schema.properties]
 * @param {Object} [schema.definitions]
 * @param {Object} [schema.items]
 * @param {[String]} [schema.transform]
 * @param {Object} defaultKeywordConfig
 * @param {Object} defaultKeywordConfig.types
 * @returns {Object} schema
 */
const setDefaultKeywords = (schema, defaultKeywordConfig) => {

  if (!schema || !!schema['$ref'] || !!schema['enum']) {
    return schema;
  }

  let isSchemaDefinition = !!(schema['$id'] || schema['$schema']);

  let type = schema.type
    ? (Array.isArray(schema.type) ? schema.type : [schema.type])
    : [];

  if (type.length === 0 && isSchemaDefinition) {
    type = ['object'];
  }

  // when then “schema” argument is a schema
  if (type.indexOf('object') >= 0) {

    // recursively process “properties” object
    if (Object.prototype.toString.call(schema.properties) === '[object Object]') {
      Object.keys(schema.properties).forEach(fieldName => {
        setDefaultKeywords(schema.properties[fieldName], defaultKeywordConfig);
      });
    }

    // recursively process “definitions” object
    if (isSchemaDefinition
        && Object.prototype.toString.call(schema.definitions) === '[object Object]') {
      Object.keys(schema.definitions).forEach(schemaName => {
        setDefaultKeywords(schema.definitions[schemaName], defaultKeywordConfig);
      });
    }

  }

  // recursively process “items” object
  if (Object.prototype.toString.call(schema.items) === '[object Object]') {
    setDefaultKeywords(schema.items, defaultKeywordConfig);
  }

  // add default keywords on fields of specified type
  Object.keys(defaultKeywordConfig.types).forEach(typeName => {
    if (type.indexOf(typeName) < 0) {
      return;
    }
    Object.keys(defaultKeywordConfig.types[typeName]).forEach(keyword => {
      schema[keyword] = schema[keyword] || defaultKeywordConfig.types[typeName][keyword];
    });
  });

  return schema;
};

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

  ajvMergePatch(ajv);
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

  let defaultKeywordConfigs = {};

  // load default keyword settings
  try {
    defaultKeywordConfigs = JSON.parse(await readFile(path.join(schemasDir, 'default-keywords.json'), 'utf8'));
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('cannot parse default-keywords.json');
    }
  }

  const defaultKeywords = [];

  // reformat default keywords configuration into [{matcher: RegExp, types: {type: {keyword: *}}}]
  Object.keys(defaultKeywordConfigs).forEach(pathPattern => {

    let defaultKeywordConfig = {
      matcher: new RegExp(
        `^${
          pathPattern
            .replace(/\*/g, '\$')
            .replace(/\$\$/g, '([^\/]+)(\/[^\/]+)*')
            .replace(/\$/g, '([^\/]+)')
        }\$`
      ),
      types: {}
    };

    Object.keys(defaultKeywordConfigs[pathPattern]).forEach(typeName => {
      defaultKeywordConfig.types[typeName] = defaultKeywordConfigs[pathPattern][typeName];
    });

    defaultKeywords.push(defaultKeywordConfig);
  });

  // load JSON schemas
  await requireDir(schemasDir, '.json', (schema, name) => {

    if (name === 'default-keywords') {
      return;
    }

    schema.$id = schema.$id || schema.id;
    schema.$schema = schema.$schema || 'http://json-schema.org/draft-07/schema#';
    schema.$async = true;

    defaultKeywords.forEach(defaultKeywordConfig => {
      if (!name.match(defaultKeywordConfig.matcher)) {
        return;
      }
      setDefaultKeywords(schema, defaultKeywordConfig);
    });

    ajv.addSchema(schema, name);
  });

  // fix AJV $merge keyword default value issue
  Object.keys(ajv['_schemas']).forEach(schemaId => {

    const schema = ajv['_schemas'][schemaId]['schema'];

    if (!(schema.$merge && schema.$merge.source && schema.$merge.with)) {
      return;
    }

    if (schema.$merge.source.$ref) {
      schema.$merge.source = JSON.parse(JSON.stringify(ajv.getSchema(schema.$merge.source.$ref).schema));
    }

    if (schema.$merge.with.$ref) {
      schema.$merge.with = JSON.parse(JSON.stringify(ajv.getSchema(schema.$merge.with.$ref).schema));
    }

    ajv.removeSchema(schema.$id || schema.id);
    ajv.removeSchema(schemaId);

    ajv.addSchema(deepAssign(
      {},
      omit(schema.$merge.source, ['$id', '$schema', '$async']),
      omit(schema.$merge.with, ['$id', '$schema', '$async']),
      omit(schema, ['$merge'])
    ), schemaId);
  });

};
