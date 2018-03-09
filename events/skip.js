exports.run = async (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
	if(!server.dispatcher){
		message.channel.send("I am currently not playing");
		return;
	}
	
	if(message.member.voiceChannelID != message.guild.voiceConnection.channel.id){
		message.channel.send("You arn't in the voice channel I'm currently playing in");
		return
	}
	
	if(message.member.hasPermission('ADMINISTRATOR') && args[1] && args[1].toLowerCase() == 'override'){
		message.channel.send('Skip override activated! Skipping current video...');
		server.dispatcher.end();
		return;
	}
	
	for(x in server.queue[0].whoSkipped){
		if(message.author.id == server.queue[0].whoSkipped[x]){
			message.channel.send('You already asked for a skip, you cannot vote again!');
			return;
		}
	}
	
	let skipRequiredPeople = Math.ceil((message.guild.voiceConnection.channel.members.size - 1) / 2);
	
	if(!server.queue[0].skipsWanted){
		server.queue[0].skipsWanted = 0;
	}
	
	if(!server.queue[0].whoSkipped){
		server.queue[0].whoSkipped = [];
	}
	
	server.queue[0].skipsWanted++;
	
	if(server.queue[0].skipsWanted < skipRequiredPeople){
		message.channel.send(message.member.displayName + ' has just requested to skip! I have ' + server.queue[0].skipsWanted + ' out of ' + skipRequiredPeople + ' votes needed.');
		server.queue[0].whoSkipped.push(message.author.id);
	} else {
		message.channel.send(message.member.displayName + ' has just requsted to skip! I have all ' + skipRequiredPeople + ' votes needed! Skipping current video...');
		server.dispatcher.end();
	}
}