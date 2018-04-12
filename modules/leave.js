module.exports = {
    name: "leave",
    aliases: ["stop"],    
    helpDesc: "Have the bot leave the voice channel and empty the queue",
    helpTitle: "Leave/Stop",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(message.guild.voiceConnection){
            message.guild.voiceConnection.disconnect();
            server.Vconnection = null;
            server.queue = null;
            server.isPlaying = false;
            message.channel.send("Left the voice channel and emptied queue");
        } else {
            message.channel.send('I\'m not in a voice channel...');
        }
    }
}