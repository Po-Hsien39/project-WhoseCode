const { Note, Comment } = require('../../util/schema');

const getComments = async (noteId) => {
  let { comments } = await Note.findById(noteId).populate('comments');
  return comments;
};

const createComment = async (noteId, name, comment) => {
  const newComment = new Comment({ name, comment });
  await Note.findByIdAndUpdate(noteId, {
    $push: { comments: newComment._id },
  });
  let { createdAt } = await newComment.save();
  return { createdAt, _id: newComment._id };
};

module.exports = { getComments, createComment };
