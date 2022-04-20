const { Note } = require('../../util/schema');

const config = (io) => {
  io.on('connection', async (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', () => {
      console.log('Collaborating Editor');
      socket.join('testRoom');
    });

    socket.on('editEvent', (event) => {
      console.log(event);
      console.log(io.sockets.adapter.rooms);
      socket.to('testRoom').emit('newEvent', event);
    });

    socket.on('saveNotes', async (event) => {
      const { noteId, content } = event;
      console.log(event);
      await Note.findOneAndUpdate(
        { noteId },
        { note: content },
        { upsert: true }
      );
    });

    socket.on('disconnect', () => {
      console.log(socket.id, 'disconnected');
      console.log(io.sockets.adapter.rooms);

      console.log('user disconnected');
    });
    socket.on('join', async (data) => {
      console.log('join', data);
      socket.join(data.room);
    });
    socket.on('leave', async (data) => {
      console.log('leave', data);
      socket.leave(data.room);
    });
  });
};

module.exports = { config };
