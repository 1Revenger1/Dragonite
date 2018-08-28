module.exports = {
    name: "leave",
    aliases: ["stop"],    
    helpDesc: "Have the bot leave the voice channel and empty the queue",
    helpTitle: "Leave/Stop",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        var clearedQueue = false;

        if(server.player){
            await server.player.disconnect();
            await bot.manager.leave(message.guild.id);
            if(server.queue){
                server.queue = null;
                clearedQueue = true;
            }
            server.player = null;
            if(clearedQueue){
                message.channel.send("Left the voice channel and emptied queue");
            } else {
                message.channel.send("Left the voice channel");
            }
        } else {
            message.channel.send('I\'m not in a voice channel...');
        }
    }
}