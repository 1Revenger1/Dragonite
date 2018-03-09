exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
	
	if(!server.queue){
		message.channel.send('Dragonite isn\'t playing right now');
		return;
	}

	if((parseInt(args[1]) <= 0) || (parseInt(args[1]) > 5)){
		message.channel.send('Looping arguement out of range. Please use a number between 1 and 5');
		return;
	}
	
	for(let i = 0; i < parseInt(args[1]); i++){
		if(server.queue[0].loop >= 5){
			message.channel.send('Looping limit of 5 reached for this song.');
			return;
		}
		server.queue[0].loop++;
		server.queue.unshift(server.queue[0]);
	}
	message.channel.send('Song looped ' + args[1] + ' times');
}