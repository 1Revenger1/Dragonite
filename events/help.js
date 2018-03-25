const Discord = require('discord.js');

module.exports = {
	name: "help",
    helpDesc: "Returns Dragonite's commands",
	helpTitle: "Help",
    aliases: [],
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
		
		var helpString = "***__Dragonite Commands__***\nUse " + server.prefix + " or @Dragonite to call commands\n\n"		

		var generalString = "**__General__**\n";
		var adminString = "**__Administration__**\n";
		var musicString = "**__Music__**\n";

		bot.commands.forEach(async (value, key, map) => {
			if(value.ignore){
				//Don't do anything	
			} else if(!value.cat || value.cat == "general"){
				generalString += "*" + value.helpTitle + "*: " + value.helpDesc + "\n";
			} else if(value.cat == "admin"){
				adminString += "*" + value.helpTitle + "*: " + value.helpDesc + "\n";
			} else if(value.cat == "music"){
				musicString += "*" + value.helpTitle + "*: " + value.helpDesc + "\n";
			}
		});

		helpString += generalString + "\n" + musicString + "\n" + adminString;

		message.channel.send(helpString);
	}
}