const Discord = require('discord.js');
const prettyMs = require('pretty-ms');
const bot = null;

exports.run = (bot) => {
    var dragonite = `./Dragonite.js`;
	this.bot = bot;


	try{
		//Color for Join Logs //#4760ff
		bot.client.on("guildMemberAdd", (member) => {
			let server = bot.servers[member.guild.id];
			
			if(server.loggingEnabled != "true" || server.loggingJoin != "true"){
				return;
			}

			var joinEmbed = new Discord.MessageEmbed()
				.setColor("#4760ff")
				.setTitle("User joined")
				.setThumbnail(member.user.displayAvatarURL())
				.setDescription(`${member} has joined!\n${member.guild.memberCount} users in this guild.`)
				.setTimestamp(new Date());

			try{
				if(server.userLogChannel != undefined){
					server.userLogChannel.send({embed: joinEmbed});
				} else {
					server.logChannel.send({embed: joinEmbed});
				}
			} catch(err){
				console.log(err);
			}
			
		});

		bot.client.on("guildMemberRemove", (member) => {
			let server = bot.servers[member.guild.id];
			
			if(server.loggingEnabled != "true" || server.loggingJoin != "true"){
				return;
			}
			
			var joinEmbed = new Discord.MessageEmbed()
				.setColor("#4760ff")
				.setTitle("User left")
				.setThumbnail(member.user.displayAvatarURL())
				.setDescription(`${member} has left!\n${member.guild.memberCount} users in this guild.`)
				.setTimestamp(new Date());

			try{
				if(server.userLogChannel != undefined){
					server.userLogChannel.send({embed: joinEmbed});
				} else {
					server.logChannel.send({embed: joinEmbed});
				}
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("messageDelete", message => {
			let server = bot.servers[message.guild.id];
			if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
				return;
			}

			var messageEmbed = new Discord.MessageEmbed()
				.setColor("#ff4747")
				.setTitle("Message deleted")
				.setThumbnail(message.member.user.displayAvatarURL())
				.setDescription(`Message content:\n${message.content}`)
				.setTimestamp(new Date());

			try{
				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("messageDeleteBulk", message => {
			let server = bot.servers[message.first().guild.id];
			if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
				return;
			}

			var messageEmbed = new Discord.MessageEmbed()
				.setColor("#ff4747")
				.setTitle("Messages deleted in bulk")
				.setDescription(`${message.size} messages deleted in ${message.first().channel}`)
				.setTimestamp(new Date());

			try{
				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});
		
		bot.client.on("messageUpdate", (oldMessage, newMessage) => {
			let server = bot.servers[oldMessage.guild.id];
			if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
				return;
			}

			if(oldMessage.content == newMessage.content){
				return;
			}

			var messageEmbed = new Discord.MessageEmbed()
				.setColor("#ff4747")
				.setTitle("Messages edited")
				.setThumbnail(oldMessage.member.user.displayAvatarURL())
				.setDescription(`Old message:\`\`\`\n${oldMessage.content}\`\`\`\nNew message:\`\`\`\n${newMessage.content}\`\`\``)
				.setTimestamp(new Date());

			try{
				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("guildBanAdd", (guild, member) => {
			let server = bot.servers[guild.id];
			if(server.loggingEnabled != "true" || server.loggingUser != "true"){
				return;
			}

			var messageEmbed = new Discord.messageEmbed()
				.setColor("#f347ff")
				.setTitle("User banned")
				.setThumbnail(member.user.displayAvatarURL())
				.setDescription(`${member} was banned`)
				.setTimestamp(new Date());

			try{
				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("guildBanRemove", (guild, member) => {
			let server = bot.servers[guild.id];
			if(server.loggingEnabled != "true" || server.loggingUser != "true"){
				return;
			}

			var messageEmbed = new Discord.messageEmbed()
				.setColor("#f347ff")
				.setTitle("User unbanned")
				.setThumbnail(member.user.displayAvatarURL())
				.setDescription(`${member} was unbanned`)
				.setTimestamp(new Date());

			try{
				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("guildMemberUpdate", (oldMember, newMember) => {
			let server = bot.servers[guild.id];
			if(server.loggingEnabled != "true"){
				return;
			}
			
			if(server.loggingUser == "true"){
				if(oldMember.nickname != newMember.nickname){
					var messageEmbed = new Discord.messageEmbed()
						.setColor("#f347ff")
						.setTitle("User nickname changed")
						.setThumbnail(member.user.displayAvatarURL())
						.setDescription(`Old nickame: ${oldMember.displayName}\nNew nickname: ${newMember.displayName}`)
						.setTimestamp(new Date());
	
					try{
						server.logChannel.send({embed: messageEmbed});
					} catch(err){
						console.log(err);
					}
				}

				if(!oldMember.roles.equals(newMember)){
					var rolesChanged = "";
					if(oldMember.roles.size > newMember.roles.size){
						oldMember.forEach(function(value, key, map) {
							if(!newMember.roles.exist(key)) rolesChanged += oldMember.roles.get(key) + ", ";
						});

						var messageEmbed = new Discord.messageEmbed()
							.setColor("#f347ff")
							.setTitle("Removed role from user")
							.setThumbnail(member.user.displayAvatarURL())
							.setDescription(`Roles removed: ${rolesChanged}`)
							.setTimestamp(new Date());

						message.channel.send({embed: messageEmbed});
					} else if(newMember.roles.size < oldMember.roles.size){
						newMember.forEach(function(value, key, map) {
							if(!oldMember.roles.exist(key)) rolesChanged += newMember.roles.get(key) + ", ";
						});

						var messageEmbed = new Discord.messageEmbed()
							.setColor("#f347ff")
							.setTitle("Gave role to user")
							.setThumbnail(member.user.displayAvatarURL())
							.setDescription(`Roles given: ${rolesChanged}`)
							.setTimestamp(new Date());

						message.channel.send({embed: messageEmbed});
					}
				}
			}
		});

	} catch(err){
		console.log(err);
	}
	
	
	
	//User Welcome/Leave
}