const { Emitter } = require('./eventEmmiter');
const { EVENTS } = require('../middlewares/events');
const { io } = require('../socket');

const responseEmitter = async (data, EVENT_NAME) => {
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
    Emitter.on(EVENTS.SIGN_UP, async (data) => {
        await responseEmitter(data, EVENTS.SIGN_UP);
    });
};

module.exports = { startEventListener }; 
