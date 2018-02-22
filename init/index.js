#!/usr/bin/env node
/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

require('colors');
const spawn = require('child_process').spawn;
const path = require('path');

// extract example.tar.gz
const childProcess = spawn('tar', [
  '-xf',
  path.join(__dirname, 'example.tar.gz'),
  '-C',
  process.env.PWD
]);

let result = new Buffer(0), error = new Buffer(0);

// standard output
childProcess.stdout.on('data', buffer => {
  result = Buffer.concat([ result, buffer ]);
});

// standard error
childProcess.stderr.on('data', buffer => {
  error = Buffer.concat([ error, buffer ]);
});

// output result
childProcess.on('close', code => {

  if (code !== 0) {
    console.log(error.toString('utf8').red);
    return;
  }

  console.log(result.toString('utf8').green);
});
