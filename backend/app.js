const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const morganBody = require('morgan-body');
const cors = require('cors');
require('dotenv-defaults').config();
const { PORT, API_VERSION } = process.env;
const { mongoose } = require('./util/mongo');
const Message = require('./util/schema');
// mongoose.
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

app.get('/test', async (req, res) => {
  let message = new Message({ name: 'test', body: 'test' });
  // await message.save();
  let result = await Message.find();
  // await mongoose.insertOne({ test: 'success' });
  res.send(result);
});

// API routes
app.use(
  '/api/' + API_VERSION,
  /* rateLimiterRoute,*/ [
    require('./server/routes/code_route'),
    require('./server/routes/user_route'),
  ]
);
server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});
