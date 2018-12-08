module.exports = {
    name: "join",
    aliases: [],    
    helpDesc: "Called automatically with Play and Search. Has the bot join the user's voice channel",
	helpTitle: "Join",
	cat: "music",
	ignore: true,
    run: async (bot, message, args) => {
    
        const server = bot.servers[message.guild.id];
		
		try{
			//Check if user is in voice channel
			if(!message.member.voice) {
				message.channel.send('You need to join a voice channel first');
				throw new Error('You need to join a voice channel first');
			}
	
			//Check if there is a default music channel
			if((server.defaultMusic != null) && (message.member.voice.channelID != server.defaultMusic.id)){
				message.channel.send('I am not allowed to join `' + message.member.voiceChannel.name + '`');
				throw new Error('The Admins have not allowed me to join this channel');
			}
		
			//Check if Dragonite can actually join the voice channel
			if(!message.member.voice.channel.joinable){
				message.channel.send('I cannot join this voice channel!');
				throw new Error('I cannot join this voice channel!');
			}
	
			//Server.player is the lavalink player
			if(!server.player){
				server.player = await bot.manager.join({
					guild: message.guild.id,
					channel: message.member.voice.channelID,
					host: "10.0.0.67"
				}, { selfdeaf: true });
			} else 
				throw new Error("Already in voice channel!");
	
			//Moved from musicplay since we keep the same player.
			server.player.on("end", () => endHandle());
			server.player.on("error", (err) => {
				console.log(err);
			})
			
			return message.reply('I have successfully connected to `' + message.member.voice.channel.name + '`');
		} catch(err){
            console.log(err);
			return message.channel.send(err.message);
		}

		//Function for when a song ends
		function endHandle() {
            let server = bot.servers[message.guild.id];
            
            if(server.queue === null){
                message.channel.send('Dragonite stopped and queue emptied');
                return;
            }
            
            server.queue.shift();
            if(server.queue[0]){
                bot.sleep(1000);
                bot.commands.get("musicplay").run(bot, message, args, true);
            } else {
                server.timeout = setTimeout(emptyQueueHandeler, 90000, server, message); //(90000ms) 1 and a half minute timeout before leaving if nothing else is queued.
				message.channel.send('Playlist finished. Use ' + server.prefix + 'leave to have the bot leave the voice channel.');
				server.queue = null;
                return;
            }
        }

        //Handles an empty queue - May eventually play from a list of music predifined in a db?
        async function emptyQueueHandeler(server, message){
            try{
                if((server.isPlaying) || (server.queue && server.queue.length > 0)){
                    return;
                }
            } catch (err) {
                console.log(err.stack);
            }


            if(server.player){
                try {
                    message.channel.send("Disconnected from `" + message.guild.channels.get(server.player.channel).name + "` due to lack of queued songs.");
                    bot.manager.leave(message.guild.id);
					server.player = null;
                } catch (err) {
                    console.log(err);
                }
            }
        }
	}
}