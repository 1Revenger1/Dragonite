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
        
        if(server.dispatcher && !server.dispatcher.paused){
            server.dispatcher.pause();
            message.channel.send("Pausing playback");
            return;
        }

        message.channel.send("Already paused");
    }
}