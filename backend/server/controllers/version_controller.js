const Version = require('../models/version_model');

const getVersions = async (req, res) => {
  const { id: noteId } = req.params;
  let { diff } = await Version.getVersions(noteId);
  res.send({ status: 'success', diff });
};

const getVersion = async (req, res) => {
  const { id: noteId, versionId } = req.params;
  let version = await Version.getVersion(noteId, versionId);
  res.send({ status: 'success', version });
};

module.exports = { getVersions, getVersion };
