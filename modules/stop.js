const Discord = require(`discord.js`);
const prettyMs = require(`pretty-ms`);

module.exports = {
    name: "stop",
    aliases: ["leave"],    
    helpDesc: "Stop playback and makes Dragonite leave the voice channel",
    helpTitle: "Stop, Leave",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(server.dispatcher && !server.dispatcher.paused){
            server.dispatcher.disconnect();
            server.queue = null;
            server.isPlaying = null;
            message.channel.send("Stopping playback");
            return;
        }

        message.channel.send("Already paused");
    }
}