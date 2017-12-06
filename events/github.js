const Discord = require('discord.js');

exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

   	var githubEmbed = new Discord.MessageEmbed()
            .setColor('#E81F2F')
			.setAuthor('Github Repo for Dragonite' , client.user.displayAvatarURL())
			.addField('Github for Dragonite:', 'https://github.com/1Revenger1/Dragonite');

	
	message.channel.send({embed : githubEmbed});

}