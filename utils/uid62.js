/*!
 * Menuet.
 * Copyright(c) 2017-present LiveBridge Co., Ltd.
 */
'use strict';

const random = require('lodash/random');
const EPOCH = 1504195200000;

/**
 * String reverser factory.
 * @param {number} length
 * @returns {function}
 */
function getReverser(length) {

  let zeros = '0'.repeat(length - 1);

  length *= -1;

  return (input) => {
    return (zeros + input).slice(length).split('').reverse().join('');
  };

}

/**
 * Encode an integer into base62 string.
 * @param {number|string} integer
 * @returns {string}
 */
const encodeBase62 = (integer) => {

  integer = parseInt(integer);

  let times = Math.floor(integer / 62);
  let remainder = integer % 62;
  let char = remainder;

  if (remainder > 9 && remainder <= 35) {
    char = String.fromCharCode(64 + remainder - 9);
  } else if (remainder > 35) {
    char = String.fromCharCode(96 + remainder - 35);
  }

  return (times > 0 ? encodeBase62(times) : '') + char;
};

/**
 * Decode an integer from base62 string.
 * @param {string} string
 * @returns {number}
 */
const decodeBase62 = (string) => {

  let number = 0, charCode, base, i = string.length - 1, j = 0;

  for (; i >= 0; i--, j++) {

    charCode = string.charCodeAt(i);

    base = Math.pow(62, j);

    if (48 <= charCode && charCode <= 57) {
      number += (charCode - 48) * base;
    } else if (65 <= charCode && charCode <= 90) {
      number += (charCode - 55) * base;
    } else if (97 <= charCode && charCode <= 122) {
      number += (charCode - 61) * base;
    }

  }

  return number;
};

/**
 * Serial number generator factory.
 * @param {number} max
 * @returns {function}
 */
function* getSerialNoGenerator(max) {

  let serial = random(0, max);

  max += 1;

  while (true) {
    serial = (serial + 1) % max;
    yield serial;
  }

}

const reverseSerialNo = getReverser(4), reverseSeconds = getReverser(13);

/**
 * UID62 generator factory.
 * @param {string|number} [code]
 * @returns {function<string>}
 */
exports.getGenerator = function(code) {

  code = (parseInt(code) || 0) % 1000;

  let serialNo1Generator = getSerialNoGenerator(1000);
  let serialNo2Generator = getSerialNoGenerator(20);

  return () => {

    let serial = serialNo1Generator.next().value;
    let timestamp = parseInt(reverseSeconds(Date.now() - EPOCH));
    let serialNo = parseInt(reverseSerialNo(serial)) * 1000 + code;

    serialNo = random(0, serialNo <= 4776336 ? 1 : 0) * 10000000 + serialNo;
    timestamp = serialNo2Generator.next().value * 10000000000000 + timestamp;

    return ('000' + encodeBase62(serialNo)).slice(-4)
      + ('0000000' + encodeBase62(timestamp)).slice(-8);
  };

};

/**
 * Resolve UID62.
 * @param {string} uid
 * @returns {{
 *   uid: string,
 *   code: number,
 *   time: Date
 * }}
 */
exports.resolve = (uid) => {
  return {
    uid: uid,
    code: decodeBase62(uid.slice(0, 4)) % 1000,
    time: new Date(
      parseInt(reverseSeconds(decodeBase62(uid.slice(4, 12)) % 10000000000000))
      + EPOCH
    )
  };
};
