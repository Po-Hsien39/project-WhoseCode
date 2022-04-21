const { Note } = require('../../util/schema');
const { getOlderVersion } = require('../../util/util');

const getVersions = (noteId) => {
  return Note.findOne({ noteId });
};

const getVersion = async (noteId, versionId) => {
  console.log(noteId, versionId);
  let { diff, version } = await Note.findOne({ noteId, versionId });
  let targetVersion = getOlderVersion(diff, version, versionId);
  return targetVersion;
};

module.exports = { getVersions, getVersion };
