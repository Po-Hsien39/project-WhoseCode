const { Note } = require('../../util/schema');
const { createNewVersion } = require('../../util/util');
const { VERSION_EDIT_TIME } = process.env;
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
      let { version, latest, updateId } = await Note.findOneAndUpdate(
        { noteId },
        [
          {
            $set: {
              latest: content,
              updateId: {
                $cond: {
                  if: { $gte: ['$updateId', parseInt(VERSION_EDIT_TIME)] },
                  then: -1,
                  else: { $add: ['$updateId', 1] },
                },
              },
            },
          },
        ],
        { new: true }
      );
      console.log(updateId);
      console.log(VERSION_EDIT_TIME);
      if (updateId === -1) {
        createNewVersion(noteId, version, latest);
      }
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
