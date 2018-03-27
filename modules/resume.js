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
        
        if(server.dispatcher && server.dispatcher.paused){
            server.dispatcher.resume();
            message.channel.send("Resuming playback");
            return;
        }

        message.channel.send("Not currently paused");
    }
}