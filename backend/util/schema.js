const mongoose = require('mongoose');
// const Schema = mongoose.Schema

const MessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name firld is required'],
  },
  body: {
    type: String,
    required: [true, 'Body firld is required'],
  },
});

const NoteSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'User field is required'],
  },
  note: {
    type: Object,
    required: [true, 'Note field is required'],
  },
});

// const Message = mongoose.model('Message', MessageSchema)
// export default Message
const Message = mongoose.model('Message', MessageSchema);
const Note = mongoose.model('Note', NoteSchema);

module.exports = { Message, Note };
