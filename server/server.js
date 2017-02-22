const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on localhost:${port}`);

const io = socketio(app);

const draws = { };

io.on('connection', (socket) => {
  socket.join('room1');

  socket.emit('join', { id: socket.id, draws });

  socket.on('sendUpdate', (data) => {
    socket.broadcast.to('room1').emit('receiveUpdate', data);
    draws[data.id] = data;
  });

  socket.on('disconnect', () => {
    socket.leave('room1');
    delete draws[socket.id];
    socket.broadcast.to('room1').emit('deleteID', { id: socket.id });
  });
});
