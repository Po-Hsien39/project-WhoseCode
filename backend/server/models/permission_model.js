const pool = require('../../util/mysqlcon');
const { Note } = require('../../util/schema');

const getPermission = async (noteId) => {
  const { permission } = await Note.findById(noteId);
  return permission;
};

module.exports = { getPermission };
