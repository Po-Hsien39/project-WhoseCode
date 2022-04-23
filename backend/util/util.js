const { diffAlgorithm } = require('../../util/util');
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
  saveDiff(diff, noteId, latest);
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
      latestBlock.splice(target.index, 0, ...target.blocks);
      index += target.blocks.length;
    }
  }
  return latestBlock;
};

module.exports = { wrapAsync, createNewVersion, getOlderVersion };
