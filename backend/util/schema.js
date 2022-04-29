const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true },
    updateId: {
      type: Number,
      default: 0,
    },
    version: {
      type: String,
      default: '',
    },
    latest: {
      type: String,
      default: '',
    },
    diff: {
      type: Array,
      default: [],
    },
    permission: {
      type: Object,
      default: {
        openToPublic: false,
        allowEdit: false,
        allowComment: false,
        allowDuplicate: false,
        allowOthers: [],
      },
    },
    comments: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: [] },
    ],
  },
  { timestamps: true }
);

const CommentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', NoteSchema);
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = { Note, Comment };
