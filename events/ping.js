module.exports = {
    name: "ping",
    aliases: [],
    run: async (bot, message, args) => {
        var dragonite = null;
        if(bot.isBeta){
            dragonite = `../Dragonite.js`;
        } else {
            dragonite = `../Dragonite.js`;
        }
    
        const server = require(dragonite).bot.servers[message.guild.id];
        var ping1 = message.createdTimestamp;
        message.channel.send('Pinging...').then((msg) =>{
            var ping2 = msg.createdTimestamp - ping1;
            try{
                msg.edit('Pong! Ping was ' + ping2 + ' ms. The Heartbeat was ' + bot.client.ping.toFixed(1) + ' ms.');
            } catch(err) {
                message.edit('Pinging... That didn\'t quite work.');
            }
        })    
    }
} 