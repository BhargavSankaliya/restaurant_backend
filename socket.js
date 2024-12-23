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
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
        }

        console.log("userSockets", userSockets);

        socket.on('registerUser', (userId) => {
            if (userId) {
                if (!userSockets.has(userId)) {
                    userSockets.set(userId, new Set());
                }
                userSockets.get(userId).add(socket.id);
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, socketIds] of userSockets.entries()) {
                if (socketIds.has(socket.id)) {
                    socketIds.delete(socket.id);
                    if (socketIds.size === 0) {
                        userSockets.delete(userId);
                    }
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
    const socketIds = userSockets.get(userId);
    if (socketIds) {
        for (const socketId of socketIds) {
            getSocketInstance().to(socketId).emit('notification', message);
        }
    }
};

module.exports = {
    socketConnection,
    getSocketInstance,
    sendNotification,
    userSockets,
};
