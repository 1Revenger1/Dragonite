module.exports = {
    name: "skip",
    aliases: [],    
    helpDesc: "Skips the current video played",
	helpTitle: "Skip",
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
		
		for(x in server.queue[0].whoSkipped){
			if(message.author.id == server.queue[0].whoSkipped[x]){
				message.channel.send('You already asked for a skip, you cannot vote again!');
				return;
			}
		}
		
		let skipRequiredPeople = Math.ceil((message.guild.channels.get(server.player.channel).members.size - 1) / 2);
		
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
			server.player.timestamp = Date.now();
			server.player.stop();
		}
	}
}