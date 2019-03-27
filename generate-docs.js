#!/usr/bin/env node
/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

require('colors');
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const writeFile = promisify(fs.writeFile);
const AJV = require('ajv');
const jsonSchemaDraft06 = require('ajv/lib/refs/json-schema-draft-06');
const ajvKeywords = require('ajv-keywords');
const ajvMergePatch = require('ajv-merge-patch');
const ejs = require('ejs');
const deepAssign = require('./utils/deep-assign');
const requireDir = require('./utils/require-dir');

const DEFAULT_PATHS = require('./config/default.json').paths;
const WORKING_DIR = process.env.PWD;
const API_DOC_TEMPLATE = fs.readFileSync(path.join(__dirname, 'views/api-doc.ejs'), 'utf8');
const SCHEMA_SPECS_TEMPLATE = fs.readFileSync(path.join(__dirname, 'views/api-doc-schema.ejs'), 'utf8');
const API_INDEX_TEMPLATE = fs.readFileSync(path.join(__dirname, 'views/api-index.ejs'), 'utf8');

/**
 * Get arguments.
 * @returns {object}
 */
const getArguments = () => {

  let args = {}, argName;

  for (let argIndex = 0; argIndex <= process.argv.length;) {

    argName = process.argv[argIndex];

    if (argName && argName.slice(0, 2) === '--') {
      argName = argName.slice(2);
      args[argName] = process.argv[argIndex + 1];
      argIndex += 2;
      continue;
    }

    argIndex++;
  }

  return args;
};

/**
 * Get JSON schema definition.
 * @param {AJV} ajv
 * @param {object} route
 * @param {string} key
 */
const getSchema = (ajv, route, key) => {

  if (!route[key]) {
    return;
  }

  let schema = ajv.getSchema(route[key]);

  if (!schema) {
    throw `schema definition not found: ${route[key]}`.red;
  }

  route[key] = schema.schema;
};

/**
 * Generate API documents.
 * @param {object} config
 * @param {[object]} docs
 * @param {string} docs.filename
 * @param {string} docs.title
 * @param {[object]} docs.routes
 * @param {number} [index=0]
 * @param {number} [apiCount=0]
 * @returns {Promise.<void>}
 */
const generateApiDocs = async (config, docs, index = 0, apiCount = 0) => {

  let doc = docs[index];

  // write API docs' index file
  if (!doc) {

    await writeFile(
      path.join(config.outputDir, 'index.html'),
      ejs.render(
        API_INDEX_TEMPLATE,
        { config, docs, apiCount, escapeHTML }
      )
    );

    return;
  }

  doc.routes = doc.routes.filter(route => !route.disabled);

  // get JSON schemas
  doc.routes.forEach(route => {
    getSchema(config.ajv, route, 'params');
    getSchema(config.ajv, route, 'query');
    getSchema(config.ajv, route, 'body');
    getSchema(config.ajv, route, 'response');
  });

  // write API docs into HTML file
  await writeFile(
    path.join(config.outputDir, doc.filename),
    ejs.render(
      API_DOC_TEMPLATE,
      { config, doc, escapeHTML, renderSchemaSpecs, getPropertyType }
    )
  );

  await generateApiDocs(config, docs, index + 1, apiCount + doc.routes.length);
};

/**
 * Escape HTML tags and entities.
 * @param {string} text
 * @returns {string}
 */
const escapeHTML = text => (text || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/`(.+?)`/g, '<code>$1</code>')
  .replace(/\[(.+?)]\((.+?)\)/g, '<a href="$2">$1</a>')
  .replace(/(\r?\n){2,}/g, '<br><br>')
  .replace(/(\r?\n)/g, '<br>')
;

/**
 * Render schema specifications.
 * @param {object} config
 * @param {object} schema
 * @param {object} [schema.$merge]
 * @param {object} [schema.$patch]
 * @param {object} [schema.$id]
 * @param {object} [schema.id]
 * @param {object} [schema.$ref]
 * @param {object} [options]
 * @param {boolean} [options.showNecessity=true]
 * @param {[string]} [options.stack]
 * @returns {string}
 */
const renderSchemaSpecs = (
  config,
  schema,
  options = {}
) => {
  options.stack = options.stack || [];

  const schemaId = (schema.$id || schema.$ref || schema.id);

  if (options.stack.length >= 2
    && [0].concat(options.stack)
      .reduce((total, next) => (total + (next === schemaId ? 1 : 0))) >= 2) {
    return '';
  } else {
    options.stack.push(schemaId);
  }

  if (typeof(options.showNecessity) === 'undefined') {
    options.showNecessity = true;
  }

  if (typeof(options.showNecessity) === 'undefined') {
    options.showNecessity = true;
  }

  if (schema.$patch) {
    throw new Error(`${schema.$id}: $patch keyword is not supported`);
  }

  if (schema.$merge && schema.$merge.source && schema.$merge.with) {

    if (schema.$merge.source.$ref) {
      const sourceRef = schema.$merge.source.$ref;
      delete schema.$merge.source.$ref;
      schema.$merge.source = deepAssign({}, config.ajv.getSchema(sourceRef).schema, schema.$merge.source);
    }

    if (schema.$merge.with.$ref) {
      const withRef = schema.$merge.with.$ref;
      delete schema.$merge.with.$ref;
      schema.$merge.with = deepAssign({}, config.ajv.getSchema(withRef).schema, schema.$merge.with);
    }

    deepAssign(schema, schema.$merge.source, schema.$merge.with);
    delete schema.$merge;
  }

  return ejs.render(
    SCHEMA_SPECS_TEMPLATE,
    {config, schema, escapeHTML, renderSchemaSpecs, getPropertyType, options}
  );
};

/**
 * Get property's type.
 * @param {object} config
 * @param {string} propertyName
 * @param {object} schema
 * @returns {string}
 */
const getPropertyType = (config, propertyName, schema) => {

  if (Array.isArray(schema.type)) {

    schema.type = schema.type.filter(type => {
      return type && (type !== 'null');
    });

    if (schema.type.length === 1) {
      schema.type = schema.type[0];
    }

  }

  if (typeof(schema.const) !== 'undefined') {
    return config.values[typeof(schema.const)];
  }

  if (!schema.type || schema.type.length === 0) {
    throw new Error(`JSON schema definition error: type of ${propertyName.bold} is required`.red);
  }

  if (typeof(schema.type) === 'string' && schema.type !== 'array') {
    return config.values[schema.type] || schema.type;
  }

  if (schema.type === 'array' && schema.items.type) {
    return `[${getPropertyType(config, propertyName, schema.items)}]`;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.map(type => {
      return config.values[type] || type;
    }).join('|');
  }

  return config.values[schema.type] || schema.type;
};

/**
 * Generate API documents.
 */
(async () => {

  let args = getArguments();

  if (!args.output) {
    throw new Error('argument \'--output\' is required'.red);
  }

  let defaultConfig = {}, config = {}, paths = {}, docs = [];

  try {
    paths = require(path.join(WORKING_DIR, 'config', 'paths.json'));
  } catch (e) {
    void(0);
  }

  paths = deepAssign(DEFAULT_PATHS, paths);

  paths.base = paths.base || '';

  Object.keys(paths).forEach(key => {
    if (key === 'base') {
      return;
    }
    paths[key] = path.join(
      paths[key].startsWith('/') ? '' : paths.base,
      paths[key]
    );
  });

  if (args.config) {
    try {
      config = require(path.join(WORKING_DIR, args.config));
    } catch (e) {
      void(0);
    }
  }

  try {

    args.lang = args.lang
      ? args.lang.toLowerCase().replace(/[^a-z]+/g, '-')
      : 'en';

    defaultConfig = require(`./config/api-doc/${args.lang}.json`);

  } catch (e) {
    defaultConfig = require('./config/api-doc/en.json');
  }

  config.ajv = ajvKeywords(new AJV({
    $data: true,
    schemaId: '$id',
    async: 'es7',
    coerceTypes: true,
    useDefaults: true,
    allErrors: true,
    removeAdditional: 'all'
  }), null);
  ajvMergePatch(config.ajv);
  config.ajv.addMetaSchema(jsonSchemaDraft06);
  config = deepAssign(defaultConfig, config);
  config.outputDir = path.join(WORKING_DIR, args.output);

  let keywords = require('./lib/json-schema/keywords');

  try {
    Object.assign(keywords, require(path.join(WORKING_DIR, paths.schemas, 'keywords')));
  } catch (e) {
    void(0);
  }

  Object.keys(keywords).forEach(keyword => {
    config.ajv.addKeyword(keyword, keywords[keyword]);
  });

  let formats = require('./lib/json-schema/formats');

  try {
    Object.assign(formats, require(path.join(WORKING_DIR, paths.schemas, 'formats')));
  } catch (e) {
    void(0);
  }

  Object.keys(formats).forEach(name => {
    config.ajv.addFormat(name, formats[name]);
  });

  // load JSON schemas
  await requireDir(
    path.join(WORKING_DIR, paths.schemas),
    {
      acceptExtNames: [ '.json' ],
      ignoreHiddenFiles: true
    },
    (schema, name) => {
      schema.$id = schema.$id || schema.id;
      schema.$schema = schema.$schema || 'http://json-schema.org/draft-07/schema#';
      schema.$async = true;
      config.ajv.addSchema(schema, name);
    }
  );

  // load route definitions
  await requireDir(path.join(WORKING_DIR, paths.routes), (doc, name) => {
    doc.filename = `${name.toLowerCase()}.html`;
    docs.push(doc);
  });

  // sort docs by index
  docs = docs
    .filter(doc => {
      return typeof(doc.index) === 'number';
    })
    .sort((a, b) => {
      return a.index - b.index;
    });

  await generateApiDocs(config, docs);

})()
  .catch(e => {
    console.error(e);
  });
