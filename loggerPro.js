const Discord = require('discord.js');
const prettyMs = require('pretty-ms');
const bot = null;

exports.run = (bot) => {
    var dragonite = `./Dragonite.js`;
	this.bot = bot;

	try{
    /*  join logs - blue - 4760ff
        delete logs - red - ff4747
        ban - magenta - f347ff
        channel - green - 3aed2d
        emojis - yellow - e0ed2d
        roles - 00ffff - cyan
    
    */
		//Color for Join Logs //#4760ff
		bot.client.on("guildMemberAdd", member => guildMemberAdd(member));
		bot.client.on("guildMemberRemove", member => guildMemberRemove(member));

		//Edited/deleted messages
		bot.client.on("messageDelete", message => messageDelete(message));
		bot.client.on("messageDeleteBulk", message => messageDeleteBulk(message));
		bot.client.on("messageUpdate", (oldMessage, newMessage) => messageUpdate(oldMessage, newMessage));
		
		//Bans
		bot.client.on("guildBanAdd", (guild, member) => guildBanAdd(guild, member));
		bot.client.on("guildBanRemove", (guild, member) => guildBanRemove(guild, member));
		
		//Logging users getting roles or changed nicknames
		bot.client.on("guildMemberUpdate", (oldMember, newMember) => guildMemberUpdate(oldMember, newMember));
		
		//Not done yet
		//Update to channels in general
		bot.client.on("channelCreate", channel => channelCreate(channel));
		bot.client.on("channeleDelete", channel => channelDelete(channel));
		bot.client.on("channelPinsUpdate", (channel, time) => channelPinsUpdate(channel, time));
		bot.client.on("channelUpdate", (oldChannel, newChannel) => channelUpdate(oldChannel, newChannel));
/*		
		//Emojis created/removed/edited
		bot.client.on("emojiCreate", emoji => emojiCreate(emoji));
		bot.client.on("emojiDelete", emoji => emojiDelete(emoji));
		bot.client.on("emojiUpdate", (oldEmoji, newEmoji) => emojiUpdate(oldEmoji, newEmoji));
		
		//Edits to roles within the server. Does not include giving roles to people
		bot.client.on("roleCreate", role => roleCreate(role));
		bot.client.on("roleDelete", role => roleDelete(role));
		bot.client.on("roleUpdate", (oldRole, newRole) => roleUpdate(oldRole, newRole));
*/
	} catch(err){
		console.log(err);
	}
		
	function isDM(message){
        try{
            return message.channel.type == 'dm';
        } catch (err) {
            console.log(err);
            console.log(message);
        }
	}

	/*
	 *  Guild Member Add: Member joined the guild
	 */
	async function guildMemberAdd(member){
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
				.setTimestamp(new Date())
				.setFooter(`User ID: ${member.id} | Username: ${member.user.username}`);


			if(server.userLogChannel != undefined){
				server.userLogChannel.send({embed: joinEmbed});
			} else {
				server.logChannel.send({embed: joinEmbed});
			}
		} catch(err){
			console.log(err);
		}
		
	}

	/*
	 *  Guild Member Remove: Member left the guild
	 */
	async function guildMemberRemove(member){
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
				.setTimestamp(new Date())
				.setFooter(`User ID: ${member.id} | Username: ${member.user.username}`);


			if(server.userLogChannel != undefined){
				server.userLogChannel.send({embed: joinEmbed});
			} else {
				server.logChannel.send({embed: joinEmbed});
			}
		} catch(err){
			console.log(err);
		}
	}

	/*
	 *  Message Delete: Singular message deleted
	 */
	async function messageDelete(message){
		try{
			//if(isDM(message)) return;
			let server = bot.servers[message.guild.id];
			if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
				return;
			}
            
            
            if(message.channel.id == server.logChannel.id) return;

			var messageEmbed = new Discord.MessageEmbed()
				.setColor("#ff4747")
				.setTitle("Message by <unknown> user deleted")
				.setDescription(`Message content:\n${message.content}`)
				.setTimestamp(new Date())
			
			if(message.member != undefined){
				messageEmbed.setTitle("Message by " + message.member.displayName + " deleted")
				.setThumbnail(message.member.user.displayAvatarURL())
				.setFooter(`User ID: ${message.member.id} | Username: ${message.member.user.username}`);
			}

            messageEmbed.addField('Channel', message.channel.name);
			server.logChannel.send({embed: messageEmbed});
		} catch(err){
			console.log(err);
		}
	}

	/*
	 *  Message Delete Bulk: Bulk delete of messages
	 */
	async function messageDeleteBulk(message){
		try{
			if(isDM(message.first())) return;
			let server = bot.servers[message.first().guild.id];
			if(server.loggingEnabled != "true" || server.loggingMessage != "true"){
				return;
			}

			var messageEmbed = new Discord.MessageEmbed()
				.setColor("#ff4747")
				.setTitle("Messages deleted in bulk")
				.setDescription(`${message.size} messages deleted in ${message.first().channel}`)
				.setTimestamp(new Date());

            messageEmbed.addField('Channel', message.first().channel.name);
			server.logChannel.send({embed: messageEmbed});
		} catch(err){
			console.log(err);
		}
	}

	/*
	 *  Message Update: When a message has been changed
	 */
	async function messageUpdate(oldMessage, newMessage){
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
				.setTimestamp(new Date())
				.setFooter(`User ID: ${oldMessage.member.id} | Username: ${oldMessage.member.user.username}`);


            messageEmbed.addField('Channel', oldMessage.channel.name);
			server.logChannel.send({embed: messageEmbed});
		} catch(err){
			console.log(err);
		}
	}

    /*
	 *  Guild Ban Add: Fired when a guild member is banned  
	 */
	async function guildBanAdd(guild, member){
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
				.setTimestamp(new Date())
				.setFooter(`User ID: ${member.id} | Username: ${member.user.username}`);
				

			server.logChannel.send({embed: messageEmbed});
		} catch(err){
			console.log(err);
		}
	}

    /*
	 *  Guild Ban Remove: Fired when a guild member is unbanned  
	 */
	async function guildBanRemove(guild, member){
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
				.setTimestamp(new Date())
				.setFooter(`User ID: ${member.id} | Username: ${member.user.username}`);


			server.logChannel.send({embed: messageEmbed});
		} catch(err){
			console.log(err);
		}
	}

    /*
	 *  Guild Member Update: Roles and nickname changes
	 */
	async function guildMemberUpdate(oldMember, newMember){
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
						.setTimestamp(new Date())
						.setFooter(`User ID: ${oldMember.id} | Username: ${oldMember.user.username}`);
	
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
							.setTimestamp(new Date())
							.setFooter(`User ID: ${oldMember.id} | Username: ${oldMember.user.username}`);

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
							.setTimestamp(new Date())
							.setFooter(`User ID: ${oldMember.id} | Username: ${oldMember.user.username}`);

						server.logChannel.send({embed: messageEmbed});
					}
				}
			}
		} catch(err){
			console.log(err);
		}
	}
    
    async function channelCreate(channel){
        try{
            let server = bot.servers[channel.guild.id];
            if(server.loggingEnabled != "true" || server.loggingChannel != "true"){
                return;
            }
                
            var messageEmbed = new Discord.MessageEmbed()
                .setColor("#3aed2d")
                .setTitle("New channel created!")
                .setDescription("Name: `" + channel.name  + "` Id: " + channel.id)
                .setTimestamp(new Date())

            server.logChannel.send({embed: messageEmbed});
        } catch (err) {
            console.log(err);
        }
    }
    
    async function channelDelete(channel){
        try{
            let server = bot.servers[channel.guild.id];
            if(server.loggingEnabled != "true" || server.loggingChannel != "true"){
                return;
            }
                
            var messageEmbed = new Discord.MessageEmbed()
                .setColor("#3aed2d")
                .setTitle("A channel was deleted!")
                .setDescription("Name: `" + channel.name  + "` Id: " + channel.id)
                .setTimestamp(new Date())

            server.logChannel.send({embed: messageEmbed});
        } catch (err) {
            console.log(err);
        }
    }
    
    async function channelPinsUpdate(channel, time){
        try{
            let server = bot.servers[channel.guild.id];
            if(server.loggingEnabled != "true" || server.loggingChannel != "true"){
                return;
            }
                
            var messageEmbed = new Discord.MessageEmbed()
                .setColor("#3aed2d")
                .setTitle("Pins edited")
                .setDescription("Channel name: `" + channel.name  + "` Channel id: " + channel.id)
                .setTimestamp(new Date())

            server.logChannel.send({embed: messageEmbed});
        } catch (err) {
            console.log(err);
        }
    }
    
    async function channelUpdate(oldChannel, newChannel){
        try{
            let server = bot.servers[oldChannel.guild.id];
            if(server.loggingEnabled != "true" || server.loggingChannel != "true"){
                return;
            }

            var messageEmbed = new Discord.MessageEmbed()
                .setColor("#3aed2d")
                .setTitle("Channel update")
                .setDescription("Channel id: " + oldChannel.id)
                .setTimestamp(new Date());
                
            if(oldChannel.name != newChannel.name){
                messageEmbed.addField("Channel name changed", "Old channel name: " + oldChannel.name  + " New channel id: " + newChannel.name + "\nChannel id: " + oldChannel.id);
            }
            
            if(oldChannel.topic && oldChannel.topic != newChannel.topic){
                messageEmbed.addField("Channel topic changed", "Old channel topic: " + oldChannel.topic + "\n\nNew channel topic: " + newChannel.topic);
            }

            server.logChannel.send({embed: messageEmbed});
        } catch (err) {
            console.log(err);
        }
    }
	//User Welcome/Leave
}