module.exports = {
    name: "leave",
    aliases: [],    
    helpDesc: "Have the bot leave the voice channel and empty the queue",
    helpTitle: "Leave",
    ignore: true,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(message.guild.me.voiceChannel){
            message.guild.me.voiceChannel.leave();
            server.Vconnection = null;
            server.queue = null;
        } else {
            message.channel.send('I\'m not in a voice channel...');
        }
    }
}