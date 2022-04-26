const { Note } = require('../../util/schema');
const { getOlderVersion } = require('../../util/util');

const getVersions = (noteId) => {
  return Note.findById(noteId);
};

const getVersion = async (noteId, versionId) => {
  console.log(noteId, versionId);
  let { diff, version } = await Note.findById(noteId);
  let targetVersion = getOlderVersion(diff, version, versionId);
  return targetVersion;
};

module.exports = { getVersions, getVersion };
