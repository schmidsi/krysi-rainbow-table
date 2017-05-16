const assert = require('assert');
const md5 = require('blueimp-md5');
const BigNumber = require('bignumber.js');

// check if the md5 function corresponds to the given rainbow-table chain
assert(md5('0000000') === '29c3eea3f305d6b823f562ac4be35217');

const initialPassword = '0000000';
const passwordLength = 7;
const chainLength = 2000;
const allowedChars = 36;

// pads a string with 0s in front according to the specified chunkSize
const pad = (string, chunkSize = passwordLength, char = '0') => {
  let padded = string;
  while (padded.length % chunkSize !== 0) padded = char + padded;
  return padded;
};
assert(pad('1') === '0000001');

const chains = Array(chainLength).fill().map((value, index) => pad(index.toString(allowedChars)));
assert(chains[0] === '0000000');
assert(chains[12] === '000000c');

const reductionFunction = (hashString, step) => {
  const hashAsNumber = new BigNumber(hashString, 16);
  let stepHash = hashAsNumber.plus(step);
  let reducedPassword = '';

  initialPassword.split('').forEach(() => {
    reducedPassword += stepHash.modulo(allowedChars).toString(36);
    stepHash = stepHash.dividedToIntegerBy(allowedChars);
  });

  return reducedPassword.split('').reverse().join('');
};
assert(reductionFunction('29c3eea3f305d6b823f562ac4be35217', 0) === '87inwgn');

const rainbowChain = [{
  password: initialPassword,
  hash: md5(initialPassword),
}];
for (let i = 0; i < 2000; i += 1) {
  rainbowChain.push({
    password: reductionFunction(rainbowChain[i].hash, i),
    hash: md5(reductionFunction(rainbowChain[i].hash, i)),
  });
}

assert(rainbowChain[1].password === '87inwgn');
assert(rainbowChain[1].hash === '12e2feb5a0feccf82a8d4172a3bd51c3');
assert(rainbowChain[2].password === 'frrkiis');
assert(rainbowChain[2].hash === '437988e45a53c01e54d21e5dc4ae658a');

