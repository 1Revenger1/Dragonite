const Discord = require('discord.js');
const prettyMs = require('pretty-ms');

exports.run = (client, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

	
	//On User join/Leave 
	//server.logging.join.enabled
					//   .channel
	
	client.on("guildMemberAdd", async (member) => {
		let server = servers[member.guild.id];
		
		if(!server.logging.join.enabled == true){
			return;
		}
		
		if(!member.guild.channels.has(server.logging.join.channel)){
			server.logging.join.enabled = false;
			server.logging.join.channel = null;
			return;
		}
		
		message.channel.send(new Discord.messageEmbed)
		
	});
	
	
	//User Welcome/Leave
}