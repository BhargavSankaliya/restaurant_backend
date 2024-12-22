const { EVENTS } = require('../events/eventListners');

const requestHandler = async (client) => {
    connectionCallback(client);
    try {
        client.onAny(async (eventName, value, ACK) => {

            console.log('call eventName', eventName);

            let data = value;
            switch (eventName) {
                case 'ORDER_PLACED':
                    return await orderPlace(data, client, ACK);
                default:
                    console.log("[requestHandler] Wrong Event call form Frontend Side : ", eventName);
                    break;
            }
        });
    } catch (error) {
        console.log('request handler error', error);
    };
};

async function connectionCallback(client) {
    client.on(EVENTS.DISCONNECT, async () => {
        console.log(`Client disconnected: ${client.id}`);
        // disconnectHandler(client);
    });
}

module.exports = {
    requestHandler
};
