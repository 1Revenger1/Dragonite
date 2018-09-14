module.exports = {
    name: "clear",
    aliases: [],    
    helpDesc: "Clears the queue",
	helpTitle: "Clear",
	cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!server.player || !server.player.playing){
			message.channel.send("I am currently not playing");
			return;
		}
		
		if(message.member.voiceChannelID != server.player.channel){
			message.channel.send("You are not in the voice channel I'm currently playing in");
			return
		}
		
        message.channel.send('Clearing playlist...');
        server.player.timestamp = Date.now();
        server.player.stop();
        server.queue = null;
	}
}