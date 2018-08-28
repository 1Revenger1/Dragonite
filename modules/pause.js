const Discord = require(`discord.js`);
const prettyMs = require(`pretty-ms`);

module.exports = {
    name: "pause",
    aliases: [],    
    helpDesc: "Pause playback",
    helpTitle: "Pause",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
        const server = bot.servers[message.guild.id];
        
        if(!server.player) return message.channel.send("The bot has no queued songs!");

        if(server.player.paused){
            return message.channel.send("Already paused");
        }
        
        server.player.pause(true);
        message.channel.send("Pausing playback");

    }
}