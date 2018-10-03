module.exports = {
    name: "ping",
    aliases: [],
    helpDesc: "Return Dragonite\'s response time",
    helpTitle: "Ping",
    run: async (bot, message, args) => {
        var dragonite = null;
        if(bot.isBeta){
            dragonite = `../Dragonite.js`;
        } else {
            dragonite = `../Dragonite.js`;
        }
    
        const server = bot.servers[message.guild.id];
        var ping1 = message.createdTimestamp;
        message.channel.send('Pinging...').then((msg) =>{
            var ping2 = msg.createdTimestamp - ping1;
            try{
                msg.edit('Pong! Response time was ' + ping2 + ' ms. The Websocket ping was ' + bot.client.ping.toFixed(0) + ' ms.');
            } catch(err) {
                message.edit('Pinging... That didn\'t quite work.');
            }
        })    
    }
} 