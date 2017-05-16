const assert = require('assert');
const md5 = require('blueimp-md5');
const BigNumber = require('bignumber.js');

// check if the md5 function corresponds to the given rainbow-table chain
assert(md5('0000000') === '29c3eea3f305d6b823f562ac4be35217');

const initialPassword = '0000000';
const passwordLength = 7;

const allowedChars = [
  '0', '1', '2', '3', '4', '5',
  '6', '7', '8', '9', 'a', 'b',
  'c', 'd', 'e', 'f', 'g', 'h',
  'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't',
  'u', 'v', 'w', 'x', 'y', 'z',
];
assert(allowedChars.length, 36);

const reductionFunction = (hashString, step) => {
  const hashAsNumber = new BigNumber(hashString, 16);
  let stepHash = hashAsNumber.plus(step);
  let reducedPassword = '';

  initialPassword.split().forEach(() => {
    reducedPassword += allowedChars[stepHash.modulo(allowedChars.length)];
    stepHash = stepHash.dividedToIntegerBy(allowedChars.length);
  });

  return stepHash;
};
assert(reductionFunction('29c3eea3f305d6b823f562ac4be35217', 1), '87inwgn');
