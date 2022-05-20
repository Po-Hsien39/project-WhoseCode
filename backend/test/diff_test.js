const { assert } = require('chai');
const { lcs } = require('../util/util.js');

describe('test diff', () => {
  it('should return correct diff', () => {
    const a = ['hello', 'world', 'this', 'is', 'a', 'test'];
    const b = ['hello', 'world', 'this', 'is', 'a', 'test', 'test'];

    assert.deepEqual(lcs(a, b), {
      blockIdOld: [0, 1, 2, 3, 4, 5],
      blockIdNew: [1, 2, 3, 4, 5, 6],
    });
  });
});

describe('test diff', () => {
  it('should return same block', () => {
    const a = ['hello'];
    const b = ['hello'];

    assert.deepEqual(lcs(a, b), {
      blockIdOld: [0],
      blockIdNew: [0],
    });
  });
});

describe('test diff', () => {
  it('should insert new block', () => {
    const a = [];
    const b = ['hello'];

    assert.deepEqual(lcs(a, b), {
      blockIdOld: [],
      blockIdNew: [],
    });
  });
});

describe('test diff', () => {
  it('should delete new block', () => {
    const a = ['hello'];
    const b = [];

    assert.deepEqual(lcs(a, b), {
      blockIdOld: [],
      blockIdNew: [],
    });
  });
});

describe('test diff', () => {
  it('should insert new block', () => {
    const a = [];
    const b = [];

    assert.deepEqual(lcs(a, b), {
      blockIdOld: [],
      blockIdNew: [],
    });
  });
});
