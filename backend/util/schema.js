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
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', NoteSchema);

module.exports = { Note };
