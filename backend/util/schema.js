const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  noteId: {
    type: Number,
    required: [true, 'User field is required'],
  },
  note: {
    type: Object,
    required: [true, 'Note field is required'],
  },
});

const Note = mongoose.model('Note', NoteSchema);

module.exports = { Note };
