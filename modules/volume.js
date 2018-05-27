module.exports = {
    name: "volume",
    aliases: ["v"],    
    helpDesc: "Set the volume of music output for Dragonite",
	helpTitle: "Volume, V <number between 0-100>",
	cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!args[1]){
			message.channel.send("Current volume: " + server.volume * 100
				+ "\nUse " + server.prefix + "volume <integer from 0-100> to change the volume");
			return;
		}
		
		if(!args[1].match(/^[0-9]+$/)){
			message.channel.send("Not a valid integer");
			return;
		}
	
		if(args[1] > 100 || args[1] < 0){
			message.channel.send("Please set a number between 0 and 100");
			return;
		}
		
		bot.db.run('UPDATE servers SET volume=' + args[1] + ' WHERE serverid=' + message.guild.id);
		server.volume = args[1]/100;
		
		message.channel.send("Volume set to " + args[1]);
		if(!server.dispatcher){
			return;
		}

		try{
			clearInterval(server.volumeInterval);

			if(server.dispatcher.volume > server.volume){
				volumeDown(server);
			} else {
				volumeUp(server);
			}
		}catch(err){
			console.log(err);
		}

    }
}

function volumeUp(server){
	server.volumeCounter = server.dispatcher.volume;
	server.volumeInterval = setInterval(function(){
		server.dispatcher.setVolume(server.volumeCounter += 0.01);
		if(server.volumeCounter >= server.volume){
			clearInterval(server.volumeInterval);
		}
	}, 60);
}

function volumeDown(server){
	server.volumeCounter = server.dispatcher.volume;
	server.volumeInterval = setInterval(function(){
		server.dispatcher.setVolume(server.volumeCounter -= 0.01);
		if(server.volumeCounter <= server.volume){
			clearInterval(server.volumeInterval);
		}
	}, 60);
}