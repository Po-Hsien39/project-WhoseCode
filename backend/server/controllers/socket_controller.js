const { Note } = require('../../util/schema');
const { createNewVersion } = require('../../util/util');
const { VERSION_EDIT_TIME } = process.env;
const config = (io) => {
  io.on('connection', async (socket) => {
    console.log('a user connected');

    socket.on('editEvent', (event) => {
      const { id } = event;
      console.log(event);
      socket.to('room' + id).emit('newEvent', event);
    });

    socket.on('changeRoom', ({ noteId, allowEdit }) => {
      console.log(socket.rooms);
      for (const room of socket.rooms.values()) {
        if (room !== socket.id) {
          socket.leave(room);
        }
      }
      if (allowEdit) socket.to('room' + noteId).emit('reset');
      socket.join('room' + noteId);
      socket.emit('joinSuccess', noteId);
    });

    socket.on('saveNotes', async (event) => {
      const { noteId, content } = event;
      let { version, latest, updateId } = await Note.findByIdAndUpdate(
        noteId,
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
      if (updateId === -1) {
        createNewVersion(noteId, version, latest);
      }
    });

    socket.on('disconnect', () => {
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
