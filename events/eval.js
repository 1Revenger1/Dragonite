const Discord = require('discord.js');

exports.run = async(client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
    if(message.author.id != '139548522377641984'){
		message.channel.send('You are not the developer...');
		return;
	}
	var searchTerm = '';
    for(var i = 1; i < args.length; i++){
        searchTerm += args[i] + " ";
    }
	
	
	try {
      return message.channel.send(`\`\`\`js\n${eval(searchTerm)}\n\`\`\``);
    } catch (e) {
      return message.channel.send(`\`\`\`js\n${e.stack}\n\`\`\``);
    }
}