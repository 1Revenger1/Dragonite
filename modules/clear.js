module.exports = {
    name: "clear",
    aliases: [],    
    helpDesc: "Clears the queue. Optionally can delete a certain number of songs or songs suggested by a user",
	helpTitle: "Clear <number of songs OR user mentions>",
	cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!server.player || !server.player.playing){
			message.channel.send("I am currently not playing");
			return;
		}
		
		if(message.member.voice.channelID != server.player.channel){
			message.channel.send("You are not in the voice channel I'm currently playing in");
			return
        }
        
        if(message.mentions.members.size > 0){    
            var deleteCounter = 0;
            message.mentions.members.forEach((value, key, map) => {
                for(var i = 1; i < server.queue.length; i++){
                    if(server.queue[i].member == value.id) {
                        server.queue.splice(i, 1);
                        deleteCounter++;
                        i--;
                    }
                }
            });
            message.channel.send('Cleared ' + deleteCounter + " songs from the playlist!");
            
        } else if(args[1]){
            if(isNaN(parseInt(args[1]))){
                return message.channel.send("Unknown argument");
            }

            server.queue.splice(1, parseInt(args[1]));
            message.channel.send("Cleared " + parseFloat(args[1]) + " songs");

        } else if (message.mentions.everyone || !args[1]){
            message.channel.send('Cleared ' + (server.queue.length - 1) + ' songs');
            server.player.timestamp = Date.now();
            server.queue.splice(1);
        }
	}
}