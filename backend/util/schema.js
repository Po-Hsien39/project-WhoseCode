const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    noteId: {
      type: Number,
      required: [true, 'Note ID is required'],
    },
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
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', NoteSchema);

module.exports = { Note };
