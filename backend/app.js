const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const morganBody = require('morgan-body');
const cors = require('cors');
const mongoose = require('mongoose');
const dbName = 'whosecode';

// require('./util/mongo');
require('dotenv-defaults').config();
const { PORT, API_VERSION } = process.env;
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

require('./server/controllers/socket_controller').config(io);

app.set('trust proxy', true);
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morganBody(app);

// CORS allow all
app.use(cors());

// API routes
app.use(
  '/api/' + API_VERSION,
  /* rateLimiterRoute,*/ [
    require('./server/routes/code_route'),
    require('./server/routes/user_route'),
    require('./server/routes/note_route'),
    require('./server/routes/version_route'),
    require('./server/routes/permission_route'),
    require('./server/routes/comment_route'),
  ]
);
server.listen(PORT, async () => {
  await mongoose.connect(`mongodb://localhost:27017/${dbName}`);
  console.log('MongoDB connected');
  console.log('listening on *:' + PORT);
});
