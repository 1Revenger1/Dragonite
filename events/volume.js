exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
	
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
	
	db.run('UPDATE servers SET volume=' + args[1] + ' WHERE serverid=' + message.guild.id);
	server.volume = args[1]/100;
	try{
		server.dispatcher.setVolume(args[1]/100);
	}catch(err){
		console.log(err);
	}
}