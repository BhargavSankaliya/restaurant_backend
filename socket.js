const { Server } = require('socket.io');

let io;
const userSockets = new Map();

const socketConnection = async (httpORhttpsServer) => {
    io = new Server(httpORhttpsServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSockets.set(userId, socket.id);
        }

        socket.on('registerUser', (userId) => {
            if (userId) {
                userSockets.set(userId, socket.id);
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });
};

const getSocketInstance = () => {
    if (!io) {
        throw new Error('Socket.io instance is not initialized.');
    }
    return io;
};

const sendNotification = (userId, message) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        getSocketInstance().to(socketId).emit('notification', message);
    }
};

module.exports = {
    socketConnection,
    getSocketInstance,
    sendNotification,
    userSockets
};
