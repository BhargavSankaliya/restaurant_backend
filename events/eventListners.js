const { Emitter } = require('./eventEmmiter');
const { EVENTS } = require('../middlewares/events');
const { getSocketInstance } = require('../socket.js');

const responseEmitter = async (data, EVENT_NAME) => {
    const io = getSocketInstance();
    io.to(data.socketId).emit(
        EVENT_NAME,
        JSON.stringify({
            en: EVENT_NAME,
            data: data.data,
            message: data.message,
        })
    );
};

const startEventListener = () => {
    Emitter.on(EVENTS.ORDER_PLACED, async (data) => {
        await responseEmitter(data, EVENTS.ORDER_PLACED);
    });
};

module.exports = { startEventListener }; 
