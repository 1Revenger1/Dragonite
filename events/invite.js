const Discord = require('discord.js');

exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
	
	try{
	var inviteEmbed = new Discord.MessageEmbed()
            .setColor('#E81F2F')
			.setAuthor('Invites for Dragonite' , client.user.displayAvatarURL())
			.addField('Invite for Dragonite to join your server:', 'https://discordapp.com/oauth2/authorize?client_id=363478897729339392&scope=bot&permissions=0x10000000\n\nThe **Manage Roles** perm is only needed if you want to enable Dragonite to be able to give out roles when requested');
			
	
	message.channel.send({embed : inviteEmbed});
	message.channel.send('Invite to join the Dragonite support group: https://discord.gg/nDbDAfx');
	} catch (err) {
		console.log(err);
	}
}