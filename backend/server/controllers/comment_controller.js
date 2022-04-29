const Comment = require('../models/comment_model');

const getComments = async (req, res) => {
  const { id: noteId } = req.params;
  const comments = await Comment.getComments(noteId);
  res.send({ comments });
};

const createComment = async (req, res) => {
  const { id: noteId } = req.params;
  const { name } = req.user;
  const { comment } = req.body;
  const { createdAt, _id } = await Comment.createComment(noteId, name, comment);
  res.send({ createdAt, name, comment, _id });
};

module.exports = { getComments, createComment };
