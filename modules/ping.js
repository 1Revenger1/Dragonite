module.exports = {
    name: "ping",
    aliases: [],
    helpDesc: "Return Dragonite\'s response time",
    helpTitle: "Ping",
    run: async (bot, message, args) => {
        var ping1 = message.createdTimestamp;
        msg = await message.channel.send('Pinging...')

        let ping2 = msg.createdTimestamp - ping1;

        try{
            msg.edit('Pong! Message ping was ' + ping2 + ' ms. The Websocket ping was ' + bot.client.ws.ping.toFixed(0) + ' ms.');
        } catch(err) {
            msg.edit('Pinging... That didn\'t quite work.');
            throw err;
        }    
    }
} 