const config = (io) => {
  io.on('connection', async (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', () => {
      console.log('Collaborating Editor');
      socket.join('testRoom');
    });

    socket.on('editEvent', (event) => {
      console.log(event);
      socket.to('testRoom').emit('newEvent', event);
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
