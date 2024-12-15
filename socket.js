const { Server, Socket } = require('socket.io')
const { requestHandler } = require('./middlewares/request');
let io;

const socketConnection = async (httpORhttpsServer) => {
    console.log("[socket] >> connection successfully");

    io = new Server(httpORhttpsServer);

    io.on('connection', async (socket) => {
        logger.info('Client connected successfully:>>', socket.id, socket.handshake.address);
        // socketBroadCast = socket.broadcast;
        await requestHandler(socket);
    });
}

module.exports = {
    socketConnection,
    io
}
