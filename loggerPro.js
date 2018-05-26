const Discord = require('discord.js');
const prettyMs = require('pretty-ms');
const bot = null;

exports.run = (bot) => {
    var dragonite = `./Dragonite.js`;
	this.bot = bot;


	try{
		//Color for Join Logs //#4760ff
		bot.client.on("guildMemberAdd", (member) => {
			try{
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
			try{
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
			try{
				if(isDM(message)) return;
				let server = bot.servers[message.guild.id];
				if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
					return;
				}

				var messageEmbed = new Discord.MessageEmbed()
					.setColor("#ff4747")
					.setTitle("Message deleted by " + message.member.displayName)
					.setThumbnail(message.member.user.displayAvatarURL())
					.setDescription(`Message content:\n${message.content}`)
					.setTimestamp(new Date());


				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("messageDeleteBulk", message => {
			try{
				if(isDM(message)) return;
				let server = bot.servers[message.first().guild.id];
				if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
					return;
				}

				var messageEmbed = new Discord.MessageEmbed()
					.setColor("#ff4747")
					.setTitle("Messages deleted in bulk")
					.setDescription(`${message.size} messages deleted in ${message.first().channel}`)
					.setTimestamp(new Date());

				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});
		
		bot.client.on("messageUpdate", (oldMessage, newMessage) => {
			try{
				if(isDM(oldMessage)) return;
				var server = null;

				server = bot.servers[oldMessage.guild.id];

				if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
					return;
				}

				if(oldMessage.content == newMessage.content){
					return;
				}

				var messageEmbed = new Discord.MessageEmbed()
					.setColor("#ff4747")
					.setTitle("Messages edited by " + oldMessage.member.displayName)
					.setThumbnail(oldMessage.member.user.displayAvatarURL())
					.setDescription(`Old message:\`\`\`\n${oldMessage.content}\`\`\`\nNew message:\`\`\`\n${newMessage.content}\`\`\``)
					.setTimestamp(new Date());


				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("guildBanAdd", (guild, member) => {
			try{
				let server = bot.servers[guild.id];
				if(server.loggingEnabled != "true" || server.loggingUser != "true"){
					return;
				}

				var messageEmbed = new Discord.MessageEmbed()
					.setColor("#f347ff")
					.setTitle("User banned")
					.setThumbnail(member.user.displayAvatarURL())
					.setDescription(`${member} was banned`)
					.setTimestamp(new Date());
					

				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("guildBanRemove", (guild, member) => {
			try{
				let server = bot.servers[guild.id];
				if(server.loggingEnabled != "true" || server.loggingUser != "true"){
					return;
				}

				var messageEmbed = new Discord.MessageEmbed()
					.setColor("#f347ff")
					.setTitle("User unbanned")
					.setThumbnail(member.user.displayAvatarURL())
					.setDescription(`${member} was unbanned`)
					.setTimestamp(new Date());


				server.logChannel.send({embed: messageEmbed});
			} catch(err){
				console.log(err);
			}
		});

		bot.client.on("guildMemberUpdate", (oldMember, newMember) => {
			try{
				let server = bot.servers[oldMember.guild.id];
				if(server.loggingEnabled != "true"){
					return;
				}
				
				if(server.loggingUser == "true"){
					if(oldMember.nickname != newMember.nickname){
						var messageEmbed = new Discord.MessageEmbed()
							.setColor("#f347ff")
							.setTitle(newMember.toString() + " nickname's changed")
							.setThumbnail(oldMember.user.displayAvatarURL())
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
							oldMember.roles.forEach(function(value, key, map) {
								if(!newMember.roles.has(key)) rolesChanged += oldMember.roles.get(key).toString() + "\n";
							});

							var messageEmbed = new Discord.MessageEmbed()
								.setColor("#f347ff")
								.setTitle("Took role from " + newMember.displayName)
								.setThumbnail(oldMember.user.displayAvatarURL())
								.setDescription(`Roles removed:\n ${rolesChanged}`)
								.setTimestamp(new Date());

							server.logChannel.send({embed: messageEmbed});
						} else if(newMember.roles.size > oldMember.roles.size){
							newMember.roles.forEach(function(value, key, map) {
								if(!oldMember.roles.has(key)) rolesChanged += newMember.roles.get(key).toString() + "\n";
							});

							var messageEmbed = new Discord.MessageEmbed()
								.setColor("#f347ff")
								.setTitle("Gave role to " + newMember.displayName)
								.setThumbnail(oldMember.user.displayAvatarURL())
								.setDescription(`Roles given: ${rolesChanged}`)
								.setTimestamp(new Date());

							server.logChannel.send({embed: messageEmbed});
						}
					}
				}
			} catch(err){
				console.log(err);
			}
		});

	} catch(err){
		console.log(err);
	}
	
	
	function isDM(message){
		return message.channel.type == 'dm';
	}
	//User Welcome/Leave
}