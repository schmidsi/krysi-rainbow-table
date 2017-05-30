const assert = require('assert');
const fs = require('fs');
const md5 = require('blueimp-md5');
const BigNumber = require('bignumber.js');

// check if the md5 function corresponds to the given rainbow-table chain
assert(md5('0000000') === '29c3eea3f305d6b823f562ac4be35217');

const passwordLength = 7;
const chainLength = 2000;
const rows = 2000; // 2000;
const allowedChars = 36;

const hashToCrack = '1d56a37fb6b08aa709fe90e12ca59e12';
// cracked password from https://crackhash.com/ as reference
const crackedPassword = '0bgec3d';
assert(md5(crackedPassword) === hashToCrack);

// pads a string with 0s in front according to the specified chunkSize
const pad = (string, chunkSize = passwordLength, char = '0') => {
  let padded = string;
  while (padded.length % chunkSize !== 0) padded = char + padded;
  return padded;
};
assert(pad('1') === '0000001');

const chains = Array(rows).fill().map((value, index) => pad(index.toString(allowedChars)));
assert(chains[0] === '0000000');
assert(chains[12] === '000000c');

const reductionFunction = (hashString, step) => {
  const hashAsNumber = new BigNumber(hashString, 16);
  let stepHash = hashAsNumber.add(step);
  let reducedPassword = '';

  Array(passwordLength).fill().forEach(() => {
    reducedPassword += stepHash.modulo(allowedChars).toString(36);
    stepHash = stepHash.dividedToIntegerBy(allowedChars);
  });

  return reducedPassword.split('').reverse().join('');
};
assert(reductionFunction('29c3eea3f305d6b823f562ac4be35217', 0) === '87inwgn');
assert(reductionFunction('39767d6ff75ceba5d3bf2f64b87f3ffa', 0) === '1ri5ptm');

// Create the rainbow table if not existing yet
let rainbowTable;

try {
  rainbowTable = JSON.parse(fs.readFileSync('rainbow-table.json'));
} catch (e) {
  console.log('creating rainbow-table');
  rainbowTable = chains.map((password, index) => {
    let lastHash = md5(password);
    let chainContainsPW = false;

    for (let i = 0; i < chainLength - 1; i += 1) {
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

      const lastPassword = reductionFunction(lastHash, i);
      lastHash = md5(lastPassword);

      if (lastHash === hashToCrack) {
        console.log('### verified hashToCrack is in rainbow table at row: ', i);
      }

      if (lastPassword === crackedPassword) {
        console.log('### verified crackedPassword is in rainbow table at row: ', i);
        chainContainsPW = i;
      }
    }

    return {
      index,
      chainContainsPW,
      date: (new Date()).toJSON(),
      start: password,
      end: reductionFunction(lastHash, chainLength - 1),
    };
  });
  assert(rainbowTable[0].start === '0000000');

  fs.writeFileSync('rainbow-table.json', JSON.stringify(rainbowTable, null, 4));
}

console.log(rainbowTable.findIndex(chain => chain.end === 'igmt8ml'));

// find the row that contains the password:
let rowIndex = -1;
// for (let i = chainLength; i >= 0 && rowIndex < 0; i -= 1) {
for (let i = 0; i >= 0 && rowIndex < 0; i -= 1) {
  let lastPassword;
  let lastHash = hashToCrack;

  for (let j = i; j <= chainLength; j += 1) {
    lastPassword = reductionFunction(lastHash, i);
    lastHash = md5(lastPassword);

    const prindex = rainbowTable.findIndex(chain => chain.end === lastPassword);
    if (prindex > -1) {
      console.log('premature result', { chain: rainbowTable[prindex], prindex, i, j, lastPassword, lastHash });
    }
  }

  rowIndex = rainbowTable.findIndex(chain => chain.end === lastPassword);

  console.log(i, lastPassword, lastHash, rowIndex);
}

// lookup the password in the given chain
const containingChain = rainbowTable[rowIndex];
let lastHash = md5(containingChain.start);
for (let i = 0; i < chainLength - 1; i += 1) {
  const lastPassword = reductionFunction(lastHash, i);
  lastHash = md5(lastPassword);

  if (lastHash === hashToCrack) {
    console.log('CRAKKED: The password was', lastPassword);
  }
}
