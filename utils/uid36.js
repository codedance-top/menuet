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

const PREFIX_CHARS = [];

let charIndex = 0;

while (PREFIX_CHARS.length < 36) {
  PREFIX_CHARS.push(charIndex.toString(36));
  charIndex++;
}

/**
 * Serial number generator factory.
 * @returns {function}
 */
function* getSerialNoGenerator() {

  let serial = { n: 0, t: 0, s: 0, ms: 0 }, time;

  while(true) {

    time = Date.now() - EPOCH;

    serial.n = (serial.n + 1) % 1000;
    serial.s = Math.floor(time / 1000);
    serial.ms = time % 1000;

    yield serial;
  }

}

const reverseSerialNo = getReverser(3);
const reverseMilliseconds = getReverser(3);
const reverseSeconds = getReverser(10);

/**
 * UID62 generator factory.
 * @param {string|number} [prefix]
 * @returns {function}
 */
exports.getGenerator = function(prefix) {

  let getPrefix;

  if (!prefix) {
    getPrefix = () => {
      return PREFIX_CHARS[random(0, PREFIX_CHARS.length - 1)];
    };
  } else if (prefix && PREFIX_CHARS.indexOf(prefix) >= 0) {
    PREFIX_CHARS.splice(PREFIX_CHARS.indexOf(prefix), 1);
    getPrefix = () => {
      return prefix;
    };
  } else {
    throw new Error('invalid prefix');
  }

  let serialNoGenerator = getSerialNoGenerator();

  return () => {

    let serial = serialNoGenerator.next().value;
    let seconds = parseInt(reverseSeconds(serial.s));
    let milliseconds = parseInt(reverseMilliseconds(serial.ms));
    let serialNo = parseInt(reverseSerialNo(serial.n)) * 1000 + milliseconds;

    serialNo = random(0, serialNo <= 679615 ? 1 : 0) * 1000000 + serialNo;
    seconds = random(0, seconds <= 8364164095 ? 7 : 6) * 10000000000 + seconds;

    return (getPrefix()
      + ('000' + serialNo.toString(36)).slice(-4)
      + ('000000' + seconds.toString(36)).slice(-7)
    ).toUpperCase();
  };

};

/**
 * Resolve UID36.
 * @param {string} uid
 * @returns {{
 *   uid: string,
 *   code: string,
 *   time: Date
 * }}
 */
exports.resolve = (uid) => {

  let serialNo = ('00000' + (parseInt(uid.slice(1, 5), 36) % 1000000)).slice(-6);
  let seconds = parseInt(uid.slice(5, 12), 36) % 10000000000;

  return {
    uid: uid,
    code: uid.slice(0, 1),
    time: new Date(
      parseInt(reverseSeconds(seconds)) * 1000
      + parseInt(reverseMilliseconds(serialNo.slice(3, 6)))
      + EPOCH
    )
  };

};
