module.exports = {
    name: "loop",
    aliases: [],    
    helpDesc: "Loops the current song being played",
    helpTitle: "Loop <int from 1-5>",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
		if(!server.queue){
			message.channel.send('Dragonite isn\'t playing right now');
			return;
		}
	
		let loopNum = parseInt(args[1]);

		if((loopNum <= 0) || (loopNum > 5) || !Number.isInteger(loopNum)){
			message.channel.send('Looping arguement out of range. Please use a number between 1 and 5');
			return;
		}
		
		for(let i = 0; i < loopNum; i++){
			if(server.queue[0].loop >= 5){
				message.channel.send('Looping limit of 5 reached for this song.');
				return;
			}
			server.queue[0].loop++;
			server.queue.unshift(server.queue[0]);
		}
		
		message.channel.send('Song looped ' + loopNum + ' times');    }
}