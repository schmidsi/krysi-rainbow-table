const assert = require('assert');
const md5 = require('blueimp-md5');
const BigNumber = require('bignumber.js');

// check if the md5 function corresponds to the given rainbow-table chain
assert(md5('0000000') === '29c3eea3f305d6b823f562ac4be35217');

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

const chains = Array(13 /* chainLength*/).fill().map((value, index) => pad(index.toString(allowedChars)));
assert(chains[0] === '0000000');
assert(chains[12] === '000000c');

const reductionFunction = (hashString, step) => {
  const hashAsNumber = new BigNumber(hashString, 16);
  let stepHash = hashAsNumber.plus(step);
  let reducedPassword = '';

  Array(passwordLength).fill().forEach(() => {
    reducedPassword += stepHash.modulo(allowedChars).toString(36);
    stepHash = stepHash.dividedToIntegerBy(allowedChars);
  });

  return reducedPassword.split('').reverse().join('');
};
assert(reductionFunction('29c3eea3f305d6b823f562ac4be35217', 0) === '87inwgn');

const rainbowChain = chains.map((password) => {
  let lastHash = md5(password);

  for (let i = 0; i < chainLength; i += 1) {
    if (password === '0000000') {
      if (i === 0) {
        assert(lastHash === '29c3eea3f305d6b823f562ac4be35217');
        assert(reductionFunction(lastHash, i) === '87inwgn');
      } else if (i === 1) {
        assert(lastHash === '12e2feb5a0feccf82a8d4172a3bd51c3');
        assert(reductionFunction(lastHash, i) === 'frrkiis');
      } else if (i === 2) {
        assert(lastHash === '437988e45a53c01e54d21e5dc4ae658a');
        assert(reductionFunction(lastHash, i) === 'dues6fg');
      } else if (i === 3) {
        assert(lastHash === 'c0e9a2f2ae2b9300b6f7ef3e63807e84');
      }
    }

    lastHash = md5(reductionFunction(lastHash, i));
  }

  console.log('row:', {
    password,
    end: reductionFunction(lastHash, chainLength),
  });

  return {
    start: password,
    end: reductionFunction(lastHash, chainLength),
  };
});
assert(rainbowChain[0].start === '0000000');


const sniffedHash = '1d56a37fb6b08aa709fe90e12ca59e12';

for (let i = chainLength; i >= 0; i -= 1) {
  const lastPassword = reductionFunction(sniffedHash);
}

