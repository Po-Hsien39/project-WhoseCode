import { convertToRaw, genKey } from 'draft-js';
const diffAlgorithm = (version, latest, reverse = true) => {
  // Compare blocks using LCS
  const { blockIdOld, blockIdNew } = lcs(version.blocks, latest.blocks);
  return generateDiff(
    blockIdOld,
    blockIdNew,
    version.blocks,
    latest.blocks,
    reverse
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
      currentDiff.push(blockNew[j]);
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
    currentDiff.push(blockNew[i]);
  }
  if (currentDiff.length > 0)
    diff.push({ index: newId, blocks: currentDiff, type: 'add' });

  return diff;
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

const deepCloneBlocks = (blocks) => {
  return blocks.map((block) => {
    return {
      ...block,
    };
  });
};

const showDiff = (oldVersion, latestVersion) => {
  if (typeof oldVersion !== 'object') oldVersion = JSON.parse(oldVersion);
  latestVersion = convertToRaw(latestVersion.getCurrentContent());
  const diff = diffAlgorithm(oldVersion, latestVersion, false);
  let { oldVersionBlocks, demoBlocks } = generateCompare(
    deepCloneBlocks(oldVersion.blocks),
    deepCloneBlocks(oldVersion.blocks),
    diff
  );
  let demoVersion = { ...oldVersion };
  latestVersion.blocks = oldVersionBlocks;
  demoVersion.blocks = demoBlocks;
  return {
    demoComprison: JSON.stringify(latestVersion),
    latestVersion: JSON.stringify(demoVersion),
  };
};

const generateCompare = (oldVersionBlocks, demoBlocks, diff) => {
  for (let i = 0; i < demoBlocks.length; i++) {
    demoBlocks[i].type += '-correct';
  }
  let index1 = 0;
  let index2 = 0;
  for (let i = 0; i < diff.length; i++) {
    let target = diff[i];
    if (target.type === 'remove') {
      for (
        let k = target.index + index2;
        k < target.index + index2 + target.length;
        k++
      ) {
        oldVersionBlocks[k].type += '-remove';
        oldVersionBlocks[k].key = genKey();
        demoBlocks[k].key = genKey();
        demoBlocks[k].text = '';
        demoBlocks[k].type = demoBlocks[k].type.slice(0, -8);
        if (demoBlocks[k].type === 'code-block') {
          demoBlocks[k].type = 'code-block-demo';
        }
      }
      index1 += target.length;
    } else {
      oldVersionBlocks.splice(target.index + index1, 0, ...target.blocks);
      demoBlocks.splice(target.index + index1, 0, ...target.blocks);
      for (
        let k = target.index + index1;
        k < target.index + index1 + target.blocks.length;
        k++
      ) {
        oldVersionBlocks[k] = { ...oldVersionBlocks[k] };
        oldVersionBlocks[k].type += '-insert';
        demoBlocks[k].type += '-correct';
      }
      index2 += target.blocks.length;
    }
  }
  return { oldVersionBlocks, demoBlocks };
};

export default showDiff;
