const Discord = require('discord.js');

module.exports = {
    name: "invite",
    aliases: [],    
    helpDesc: "invite for Dragonite and associated guild",
    helpTitle: "Invite",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
		try{
			var inviteEmbed = new Discord.MessageEmbed()
					.setColor('#E81F2F')
					.setAuthor('Invites for Dragonite' , bot.client.user.displayAvatarURL())
					.addField('Invite for Dragonite to join your server:', 'https://discordapp.com/oauth2/authorize?client_id=363478897729339392&scope=bot&permissions=0x10000000\n\nThe **Manage Roles** perm is only needed if you want to enable Dragonite to be able to give out roles when requested')
					.addField('Invite to Dragonite support group', 'https://discord.gg/nDdDAfx');
			
			message.channel.send({embed : inviteEmbed});
		} catch (err) {
			console.log(err);
		}    
	}
}

exports.run = (client, message, args, isBeta, db) => {

}