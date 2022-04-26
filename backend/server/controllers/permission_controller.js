const Permission = require('../models/permission_model');

const getPermission = async (req, res) => {
  const { id: noteId } = req.params;
  if (!noteId) return res.status(400).send('noteId is required');
  const permission = await Permission.getPermission(noteId);
  res.send({ status: 'success', permission });
};

module.exports = { getPermission };
