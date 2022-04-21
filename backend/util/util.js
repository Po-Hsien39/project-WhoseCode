require('./mongo');
const { Note } = require('./schema');
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};

const createNewVersion = async (noteId, version, latest) => {
  const diff = diffAlgorithm(version, latest);
  console.log(diff);
  saveDiff(diff, noteId, latest);
};

const lcs = (a, b) => {
  const m = a.length;
  const n = b.length;
  const c = [];
  const d = [];
  for (let i = 0; i <= m; i++) {
    c[i] = [];
    d[i] = [];
    for (let j = 0; j <= n; j++) {
      c[i][j] = 0;
      d[i][j] = 0;
    }
  }
  // l represents left direction in the matrix
  // r represents right direction in the matrix
  // d represents diagonal direction in the matrix (i-1, j-1)
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (sameBlock(a[i - 1], b[j - 1])) {
        c[i][j] = c[i - 1][j - 1] + 1;
        d[i][j] = 'd';
      } else if (c[i - 1][j] >= c[i][j - 1]) {
        c[i][j] = c[i - 1][j];
        d[i][j] = 'l';
      } else {
        c[i][j] = c[i][j - 1];
        d[i][j] = 'r';
      }
    }
  }
  let blockIdOld = [];
  let blockIdNew = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (d[i][j] === 'd') {
      blockIdOld.push(i - 1);
      blockIdNew.push(j - 1);
      i--;
      j--;
    } else if (d[i][j] === 'l') {
      i--;
    } else {
      j--;
    }
  }
  blockIdOld.sort((a, b) => a - b);
  blockIdNew.sort((a, b) => a - b);
  return { blockIdOld, blockIdNew };
};
const sameBlock = (aBlock, bBlock) => {
  return aBlock.type === bBlock.type && aBlock.text === bBlock.text;
};
const diffAlgorithm = (version, latest) => {
  if (version) {
    version = JSON.parse(version);
  } else {
    version = { blocks: [] };
  }
  latest = JSON.parse(latest);

  // Compare blocks using LCS
  const { blockIdOld, blockIdNew } = lcs(version.blocks, latest.blocks);
  return generateDiff(
    blockIdOld,
    blockIdNew,
    version.blocks,
    latest.blocks,
    true
  );
};
const generateDiff = (blockIdOld, blockIdNew, blockOld, blockNew, reverse) => {
  if (reverse) {
    let temp = blockIdOld;
    blockIdOld = blockIdNew;
    blockIdNew = temp;
    temp = blockOld;
    blockOld = blockNew;
    blockNew = temp;
  }
  const diff = [];
  let oldId = 0;
  let newId = 0;
  let currentDiff = [];
  for (let i = 0; i < blockIdOld.length; i++) {
    currentDiff = [];
    if (blockIdOld[i] !== blockIdNew[i])
      diff.push({
        index: oldId,
        length: blockIdOld[i] - oldId,
        type: 'remove',
      });
    oldId = blockIdOld[i] + 1;
    for (let j = newId; j < blockIdNew[i]; j++) {
      currentDiff.push({ block: blockNew[j] });
    }
    if (currentDiff.length > 0)
      diff.push({ index: newId, blocks: currentDiff, type: 'add' });
    newId = blockIdNew[i] + 1;
  }
  // Last row
  if (blockOld.length !== oldId)
    diff.push({
      index: oldId,
      length: blockOld.length - oldId,
      type: 'remove',
    });
  currentDiff = [];
  for (let i = newId; i < blockNew.length; i++) {
    currentDiff.push({ block: blockNew[i] });
  }
  if (currentDiff.length > 0)
    diff.push({ index: newId, blocks: currentDiff, type: 'add' });

  return diff;
};

const saveDiff = async (diff, noteId, latest) => {
  await Note.findOneAndUpdate(
    { noteId },
    {
      version: latest,
      $push: {
        diff: { diff: JSON.stringify(diff), date: new Date() },
      },
    }
  );
};

const getOlderVersion = (diff, version, versionId) => {
  const diffs = diff.slice(versionId);
  let latestVersion = JSON.parse(version);
  let latestBlock = latestVersion.blocks;
  console.log(diffs);
  for (let i = diffs.length - 1; i >= 0; i--) {
    let currentDiff = diffs[i];
    console.log(currentDiff);
    latestBlock = processDiff(JSON.parse(currentDiff.diff), latestBlock);
  }
  latestVersion.blocks = latestBlock;
  return JSON.stringify(latestVersion);
};

const processDiff = (diff, latestBlock) => {
  let index = 0;
  for (let i = 0; i < diff.length; i++) {
    let target = diff[i];
    if (target.type === 'remove') {
      latestBlock.splice(target.index + index, target.length);
      index -= target.length;
    } else {
      latestBlock.splice(target.index + index, 0, ...target.blocks);
      index += target.blocks.length;
    }
  }
  return latestBlock;
};

module.exports = { wrapAsync, createNewVersion, getOlderVersion };
