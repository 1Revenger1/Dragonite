const Discord = require(`discord.js`);
const prettyMs = require(`pretty-ms`);

module.exports = {
    name: "resume",
    aliases: ["unpause"],    
    helpDesc: "Resume playback",
    helpTitle: "Resume",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!server.player) return message.channel.send("The bot has no queued songs!");

        if(!server.player.paused){
            return message.channel.send("Already playing");
        }
        
        server.player.pause(false);
        message.channel.send("Resuming playback");
    }
}