module.exports = {
    name: "shuffle",
    aliases: [],    
    helpDesc: "Shuffles the current queue",
	helpTitle: "Shuffle",
	cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
		try{    
			if(!server.queue){
				message.channel.send("Dragonite isn't playing right now");
				return;
			}
			
			if(server.queue.length <= 2){
				message.channel.send("Queue is not long enough to shuffle.");
				return;
			}
			
			var currentIndex = server.queue.length, temporaryValue, randomInex;
			var tempArray = server.queue;
			
			var firstVal = tempArray[0];
			tempArray.shift();
	
			for(var i = tempArray.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = tempArray[i];
				tempArray[i] = tempArray[j];
				tempArray[j] = temp;
			}
	
			tempArray.unshift(firstVal);
			server.queue = tempArray;
			message.channel.send("Queue shuffled");
		} catch(err) {
			message.channel.send("Could not shuffle for some unknown reason");
			Console.log(err);
		}
    }
}