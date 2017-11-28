const Discord = require('discord.js');
const client = new Discord.Client();
const opus = require('node-opus');
//const readline = require('readline');
const fs = require('fs');
const ytdl = require('ytdl-core');
const sqlite3 = require('sqlite3').verbose();
const request = require('request');

var db = new sqlite3.Database('database.txt')

var ytkey = ''; //Change to server specefic if added to more servers.

client.login('');

var prefix = '!!';
var version = '0.5.3';
var pages;
var msgDM;
var tempStorage = {};
//ID, musicChannel, logChannel

var servers = {};

var isTakingCommands = false;

var timer = 0;

function changeGame() {
	if(timer === 0){
		client.user.setGame('with other sentient bots...what?');
		timer = 1;
	}
	if(timer === 1){
		client.user.setGame('Default prefix is ??');
		timer = 2;
	}
	if(timer === 2){
		client.user.setGame('I\'m in ' + Object.keys(servers).length + ' guilds!');
		timer = 0;
	}
}

db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS servers(serverid TEXT, prefix TEXT DEFAULT \'??\', volume TEXT DEFAULT 0.5, levelsEnabled TEXT DEFAULT false, levelsEnabled TEXT DEFAULT false, levelsAnnounceInDM TEXT DEFAULT false, levelupMsg TEXT DEFAULT \'Congrats, you have leveled up!\', roleIDs TEXT, selfAssignOn TEXT DEFAULT false)");
	/*db.run("ALTER TABLE servers ADD COLUMN levelsEnabled");
	db.run("Alter Table servers ADD COLUMN levelsAnnounceInDM");
	db.run("ALTER TABLE servers ADD COLUMN levelUpMsg");
	db.run("ALTER TABLE servers ADD COLUMN roleIDs");
	db.run("ALTER TABLE servers ADD COLUMN selfAssignOn");
*/
});


client.on('ready', () => {
	db.serialize(function() {
		db.each("SELECT serverid, prefix, volume, levelsEnabled, levelsAnnounceInDM, levelUpMsg, roleIDs, selfAssignOn FROM servers", function(err, row) {
			servers[row.serverid] = {
				prefix: row.prefix,
				volume: parseInt(row.volume)/100,
				levelsEnabled: row.levelsEnabled,
				levelsAnnounceInDM: row.levelsAnnounceInLevels,
				levelUpMsg: row.levelUpMsg,
				selfAssignOn: row.selfAssignOn
			}
			if(row.roleIDs){
				servers[row.serverid].roles = [];
				let roleIDs = row.roleIDs.split(" ");
				for(var i = 0; i < roleIDs.length - 1; i++){
					//console.log(client.guilds.get('363798742857678859').name);
					servers[row.serverid].roles[i] = client.guilds.find('id', row.serverid).roles.find('id', roleIDs[i]);
				}
			} else {
				servers[row.serverid].roles = [];
			}
		}, function(err, rows) {
			console.log('I am ready!');
			setInterval(changeGame, 10000);
			isTakingCommands = true;
		})
	})
})

client.on('guildCreate', guild => {
	db.run("INSERT INTO servers (serverid) VALUES(" + guild.id +")");
	servers[guild.id] = {
		prefix: '??'
	};
})

client.on('guildDelete', guild => {
	db.run("DELETE FROM servers WHERE serverid=" + guild.id);
})

function play(message){ //play music command
	var server = servers[message.guild.id];



	if(!server.isPlaying){
		server.isPlaying = true;
		if(server.volume == null){
			streamOptions = {volume: 0.50}
		} else {
			var streamOptions = { volume: server.volume}
		}
		message.channel.send('Now playing ' + server.queue[0].title);
		try{
			server.dispatcher = server.Vconnection.playStream(ytdl(server.queue[0].url, {filter: "audioonly"}), streamOptions);
			server.debounceSong = false;
		} catch(err) {
			try{
				server.message.send('Please have Dragonite join a channel first');
			} catch(err){
				console.log('Oh noooos!');
			}

			server.debounceSong = false;
			return;
		}

	} else {
		return;
	}

	server.dispatcher.on("end", function() {
		var server = servers[message.guild.id];
		if(server.debounceSong === false){
			server.debounceSong = true;
			if(server.queue != null){
				server.queue.shift();
				if(server.queue[0]){
					server.isPlaying = false;
					play(message);
				} else {
					server.isPlaying = false;
					server.debounceSong = false;
					message.channel.send('Playlist finished. Use ' + servers[message.guild.id].prefix + 'leave to have the bot leave the voice channel.');
				}
			} else {
				message.channel.send('Dragonite stopped and queue emptied');
			}
		}
	}); 
}

function help(message){
	var embedGen = new Discord.RichEmbed()
		.setColor('#E81F2F')
		.setTitle('Dragonite Commands')
		//Fields
		.addField("Version", "Prints out the current version of Dragonite")
		.addField("Ping", "Return Dragonite\'s response time")
		.addField("Role <optional:Role Name>", "Will give a list of self-assignable roles unless you give it a role you want")
		.addField("HelpMusic", "Commands for music")
		.addField("HelpAdministrator", "Commands for Administrator commands")

	message.channel.send({embed: embedGen});
}

function helpMusic(message){
	var embedMus = new Discord.RichEmbed()
		.setColor('#E81F2F')
		.setTitle('Dragonite Music Commands')
		//Music Commands
		.addField("Join", "Makes Dragonite join the current voice channel you are in")
		.addField("Play <URL>", "Streams music from youtube video or playlist link to voice channel Dragonite is in and adds it to the queue")
		.addField("NowPlaying, np", "Gives title of the song currently playing")
		.addField("Skip", "Skips the current song")
		.addField("Stop", "Stops Dragonite streaming and forces it to leave the voice channel")
		.addField("Pause", "Pauses playback of the stream")
		.addField("Resume, Unpause", "Resumes playback of the stream")
		.addField("Queue <optional: page>", "Returns the current queue")
		.addField("Volume <number out of 100>", "Changes the volume of playback. Only applies when next video begins")
		.addField("Search <Search terms>", "Searches youtube for video, then plays first result.");

	message.channel.send({embed: embedMus});
}

function helpAdmin(message){
	var embedAdmin = new Discord.RichEmbed()
		.setColor('#E81F2F')
		.setTitle('Administrative Commands')
		//Administrative Commands
		.addField("addRole <Name of Role>", "Adds role to the list of self-assignable roles")
		.addField("removeRole <Name of Role>", "Removes role from list of self-assignable roles")
		.addField("Options <optional:option> <optional:value>", "Allows Adminis to set server options")
		.addField("ChangePrefix <new prefix>", "Allows members with the Administrator permission to change the prefix for the server")
		.addField("Prefix", "Returns current prefix saved for this server");
				
	message.channel.send({embed: embedAdmin});
}

client.on('message', message => { 
	if(!isTakingCommands){
		message.channel.send("Please wait one minute for Dragonite to start up, thanks!");
		return;
	}

	                    //Command Start
	if(message.guild === null){ //Sentience
		msgDM = message;
		if(message.author.id === '139548522377641984'){
			try{
				currentChannel.send(msgDM.content);
			} catch(err) {
				message.channel.send('You haven\'t typed in a guild yet you dumbo!');
			}

		}

	}else { //Everything else

		/*if(!server.users[message.member.discriminator]){
			server.users[message.member.discriminator] = {
				exp: 0,
				level: 0,
				lastMessage: 0
			}
		}
	
		if(message.createdTimestamp - server.users[message.member.discriminator].lastMessage > 1000 && server.levelsEnabled == "true"){
			server.users[message.member.discriminator].lastMessage = message.createdTimestamp;
			server.users[message.member.discriminator].exp += (Math.random * 10) + 15;
			if(server.users[message.member.discriminator].exp >= 5 * Math.pow(server.users[message.member.discriminator].level), 3 / 5){
				server.users[message.member.discriminator].level++;
				if(server.levelsAnnounceInLevels == true){
					message.channel.reply('Congrats, you have leveled up to ' + '')
				}
			}
		}*/
		server = servers[message.guild.id];    
		if(servers[message.guild.id].prefix){
			prefix = servers[message.guild.id].prefix;
		}

		if(message.author.id === '139548522377641984'){
			currentChannel = message.channel;
		}

		let args = message.content.split(" ");

		
	if((args[0].toLowerCase() == '??' + 'changeprefix') && (message.member.hasPermission('ADMINISTRATOR'))){
		servers[message.guild.id].prefix = args[1];
		db.run('UPDATE servers SET prefix=\'' + args[1] + '\' WHERE serverid = ' + message.guild.id);
		message.channel.send('Used default prefix to set server prefix to ' + servers[message.guild.id].prefix);
	}	

		switch(args[0].toLowerCase()){
			case prefix + 'help':
				help(message);
				break;

			case prefix + 'helpmusic':
				helpMusic(message);
				break;
			
			case prefix + 'helpadministrator':
				helpAdmin(message);
				break;

			case prefix + 'options':
				if(!message.member.hasPermission('ADMINISTRATOR')){
					message.channel.send("You do not have the perms to change server settings for Dragonite");
					return;
				}
				if(!args[1]){
					message.channel.send("Use \"" + servers[message.guild.id].prefix + "options selfAssignOn (true or false)\" to turn self-assignable roles off");
					return;
				}
				switch(args[1]){
					case "selfAssignOn":
						if(args[2] == "true"){
							servers[message.guild.id].selfAssignOn = 'true';
							db.run("UPDATE servers SET selfAssignOn=\'true\' WHERE serverid = " + message.guild.id);
							message.channel.send("Self-Assignable Roles were enabled!");
						} else if(args[2] == "false"){
							servers[message.guild.id].selfAssignOn = 'false';
							db.run("UPDATE servers SET selfAssignOn=\'false\' WHERE serverid = " + message.guild.id);
							message.channel.send("Self-Assignable Roles were disabled!");
						} else{
							message.channel.send("Value not valid, please use \"true\" or \"false\"");
						}
						break;
				}
				break;
			case prefix + 'changeprefix':
				if(message.member.hasPermission('ADMINISTRATOR')){
					servers[message.guild.id].prefix = args[1];
					db.run('UPDATE servers SET prefix=\'' + args[1] + '\' WHERE serverid = ' + message.guild.id);
					message.channel.send('Bot prefix for the server changed to ' + servers[message.guild.id].prefix);
				} else {
					message.channel.send('You do not have the required permissions to change the prefix in this server. Requires Administrator'); //Timeout error
				}

				break;
			case prefix + 'prefix':

				message.channel.send(prefix);
				break;

			case prefix + 'role':
				if(!(servers[message.guild.id].selfAssignOn == 'true')){
					message.channel.send("Self Assignable Roles are not enabled on this server! Please ask an administrator to turn it on using " + servers[message.guild.id].prefix + "options");
					return;
				}
				if(!args[1]){
					var msg = "Here are the current roles that are assignable:";
					if(servers[message.guild.id].roles[0] == null) {
						message.channel.send("No roles are assigned yet to be given out! Use " + prefix + "addRole <Name of role>");
						break;
					}
					for(var i = 0; i < servers[message.guild.id].roles.length; i++){
						msg += "\n" + servers[message.guild.id].roles[i].name;
					}
					msg += "\nYou can assign these roles by using " + servers[message.guild.id].prefix + "role <name of role>";
					message.channel.send(msg);
				} else {
					if(!client.guilds.get(message.guild.id).me.hasPermission("MANAGE_ROLES")){
						message.channel.send("I don't have the perms to manage roles!");
						return;
					}
					var roleArg = "";
					for(var i = 1; i < args.length; i++){
						roleArg += args[i] + " ";
					}
					roleArg = roleArg.trim();

					var isRole = false;
					var roleToGive;
					for(var i = 0; i < servers[message.guild.id].roles.length; i++){
						if(roleArg == servers[message.guild.id].roles[i].name){
							isRole = true;
							roleToGive = servers[message.guild.id].roles[i];
						}
					}
					if(isRole == true){
						try{
							message.member.addRole(roleToGive , "The user requested the role");
							message.channel.send("Giving " + roleToGive.name + " to " + message.member.displayName);
						} catch(err) {
							message.channel.send("That didn't quite work...please try again!");
						}
					} else {
						message.channel.send("Role does not exist");
					}
				}
				break;
			case prefix + 'addrole':
				if(!(servers[message.guild.id].selfAssignOn == 'true')){
					message.channel.send("Self Assignable Roles are not enabled on this server! Please ask an administrator to turn it on using " + servers[message.guild.id].prefix + "options");
					return;
				}
				if(message.member.hasPermission('ADMINISTRATOR')){
					var roleArg = "";
					for(var i = 1; i < args.length; i++){
						roleArg += args[i] + " ";
					}
					roleArg = roleArg.trim();
					if(!message.guild.roles.exists('name', roleArg)){
						message.channel.send("Role does not exist");
						return;
					}

					for(var i = 0; i < servers[message.guild.id].roles.length; i++){
						if(roleArg == servers[message.guild.id].roles[i].name){
							message.channel.send("Role already in list!");
							return;
						}
					}

					servers[message.guild.id].roles[servers[message.guild.id].roles.length] = message.guild.roles.find('name', roleArg);
					message.channel.send(roleArg + " added to the avaliable roles users can add.");
					var dbInsert = "";
					for(var i = 0; i < servers[message.guild.id].roles.length; i++){
						dbInsert += servers[message.guild.id].roles[i].id + " ";
					}
					db.run("UPDATE servers SET roleIDs =\'" + dbInsert + "\' WHERE serverid = " + message.guild.id);
				} else {
					message.channel.send("You do not have the perms to use this command.");
				}
				break;
			case prefix + 'removerole':
				if(!(servers[message.guild.id].selfAssignOn == 'true')){
					message.channel.send("Self Assignable Roles are not enabled on this server! Please ask an administrator to turn it on using " + servers[message.guild.id].prefix + "options");
					return;
				}
				var roleArg = "";
				for(var i = 1; i < args.length; i++){
					roleArg += args[i] + " ";
				}
				roleArg = roleArg.trim();
				if(!args[1]){
					message.channel.send("Please give name of the role you want to remove from the list of self-assignable roles.");
					return;
				}

				for(var i = 0; i < servers[message.guild.id].roles.length; i++){
					if(roleArg == servers[message.guild.id].roles[i].name){
						servers[message.guild.id].roles.splice(i, 1);
						message.channel.send("Succesfully removed " + roleArg + " from list of self-assignable roles.");
						return;
					}
				}
				message.channel.send("Unsuccesful in removed Role from list, please make sure the role name is spelt and capitalized correctly.");
				break;
			case prefix + 'version':
				message.channel.send('Dragonite v' + version);
				break;
			case prefix + 'ping':
				var ping1 = message.createdTimestamp;
				message.channel.send('Pinging...').then((msg) =>{
					var ping2 = msg.createdTimestamp - ping1;
					try{
						msg.edit('Pong! Ping was ' + ping2 + ' ms. The Heartbeat was ' + client.ping + ' ms.');
					} catch(err) {
						message.edit('Pinging... That didn\'t quite work.');
					}
				})
				break;

			//Voice Channel stuff
			case prefix + 'join': //join voice channel

				if(message.member.voiceChannel) {
					message.member.voiceChannel.join()
						.then(connection => {
							servers[message.guild.id].Vconnection = connection;
							message.reply('I have successfully connected to the channel!');
						});
				} else {
					message.channel.send('You need to join a voice channel first!');
				}
				break;
			case prefix + 'leave': //leave voice channel

				if(message.guild.me.voiceChannel){
					message.guild.me.voiceChannel.leave();
					servers[message.guild.id].queue = null;
				} else {
					message.channel.send('I\'m not in a voice channel...');
				}
				break;

			case prefix + 'search':

				if(!servers[message.guild.id].queue) {
					servers[message.guild.id].queue = [];
				}

				if(!message.guild.me.voiceChannel){ //checks if bot is in a voice channel
					message.channel.send('The bot must be in a channel');
					return;
				}

				var searchTerm = '';
				for(var i = 1; i < args.length; i++){
					searchTerm += args[i] + " ";
				}
				request('https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=' + encodeURIComponent(searchTerm) + '&key=' + ytkey, (error, response, body) => {
					var results = JSON.parse(body);
					console.log(results.items[0].id.videoId);
					if('error' in results) {
						message.channel.send('An error has occured...');
					} else if(results.items.length === 0) {
						message.channel.send('No results found. Please try using different terms');
					} else {
						ytdl.getInfo("www.youtube.com/watch?v=" + results.items[0].id.videoId, function(err, info) {
							servers[message.guild.id].queue.push(song = {
								url: "https://www.youtube.com/watch?v=" + results.items[0].id.videoId,
								title: info.title,
								author: info.author.user,
								serverid: message.guild.id
							});
							message.channel.send('Added ' + info.title + ' by ' + info.author.user + ' to the queue!');
							play(message);
						})
					}
				})
				break;
			case prefix + 'play': //play command

				if(!args[1]){ //checks if link is provided
					message.channel.send('Please provide a link...');
					return;
				}

				if(!message.guild.me.voiceChannel){ //checks if bot is in a voice channel
					message.channel.send('The bot must be in a channel');
					return;
				}

				if(!servers[message.guild.id].queue) {
					servers[message.guild.id].queue = [];
				}

				var song = {};
				var nextPageToken;

				try{
					if(args[1].indexOf("playlist?list=") >= 0){
						let playlistID = args[1].split('=');
						var playlist = requestPlaylist(playlistID, ytkey, '', servers, message);
						function requestPlaylist(playlistID, ytkey, nextPageToken, servers, message){
							request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistID[1] + "&key=" + ytkey + "&pageToken=" + nextPageToken, (error, reponse, body) => {
								var playlist = JSON.parse(body);
								if('error' in playlist){
									message.channel.send('Error getting playlist');
									return;
								} else if(playlist.items.length === 0){
									message.channel.send('The playlist is empty!');
									return;
								} else {
									var i = 0;
									for(i; i < playlist.items.length; i ++){
										song = {
											url: "https://www.youtube.com/watch?v=" + playlist.items[i].snippet.resourceId.videoId,
											title: playlist.items[i].snippet.title,
											author: '(does not work with playlist)',
											serverid: message.guild.id
										}
										servers[message.guild.id].queue.push(song);
									} 
								}
								nextPageToken = playlist.nextPageToken;
								console.log(nextPageToken);
								if(nextPageToken != undefined){
									requestPlaylist(playlistID, ytkey, nextPageToken, servers, message);
									return;
								} else {
									message.channel.send('Playlist imported to queue');
									play(message);
								}
							});
						}

					} else {
						ytdl.getInfo(args[1], function(err, info) {
						song = {
							url: args[1],
							title: info.title,
							author: info.author.user,
							serverid: message.guild.id
						}
						servers[message.guild.id].queue.push(song);
					
						message.channel.send(song.title + ' by ' + song.author + ' added to queue');

						play(message);
					})}
				} catch(e) {
						console.log(e.message);
						message.channel.send('Please use a real link...');
						servers[message.guild.id].queue.shift();
				}

				break;
			case prefix + 'skip': //skips song
				if(servers[message.guild.id].dispatcher) servers[message.guild.id].dispatcher.end();
				break;

			case prefix + 'stop': //removes bot
				if(message.guild.voiceConnection){
				message.guild.voiceConnection.disconnect();
				servers[message.guild.id].queue = null;
				}
				break;

			case prefix + 'pause':
				if(message.guild.voiceConnection) message.guild.voiceConnection.dispatcher.pause();
				break;

			case prefix + 'resume':
			case prefix + 'unpause':
				if(message.guild.voiceConnection) message.guild.voiceConnection.dispatcher.resume();
				break;

			case prefix + 'volume': //sets volume

				db.run('UPDATE servers SET volume=' + args[1] + ' WHERE serverid=' + message.guild.id);
				servers[message.guild.id].volume = args[1]/100;
				break;
			case prefix + 'queue':

			if(servers[message.guild.id].queue){
				pages = Math.floor(servers[message.guild.id].queue.length / 10) + 1;
				if(args[1]){
					page = args[1];
					var queueS = '';
					for(var songn = 0; songn + 10 * (page - 1) < (servers[message.guild.id].queue.length) && songn < 10; songn++){
						queueS += '`[' + (songn + 10 * (page - 1) + ']` ' + servers[message.guild.id].queue[songn + 10 * (page - 1)].title + ' by ' + servers[message.guild.id].queue[songn + 10 * (page - 1)].author + '\n');
					}
					message.channel.send('Page **' + page + '** of **' + pages + '**\n\n' + queueS);
				} else {
					page = 0;
					var queueS = '';
					for(var songn = 0; songn + 10 * (page) < (servers[message.guild.id].queue.length) && songn < 10; songn++){
						queueS += '`[' + (songn + 10 * (page) + ']` ' + servers[message.guild.id].queue[songn + 10 * (page)].title + ' by ' + servers[message.guild.id].queue[songn + 10 * (page)].author + '\n');
					}
					message.channel.send('Page **' + (page + 1) + '** of **' + pages + '**\n\n' + queueS + '\n Use the Queue command with a page number to see other pages!');
				}					

			} else {
				message.channel.send('Queue has not been created yet');
			}

				break;
			case prefix + 'np':
			case prefix + ('nowplaying'):
				if(!servers[message.guild.id].isPlaying){
					break;
				} else {
					message.channel.send('Currently playing ' + servers[message.guild.id].queue[0].title + ' by ' + servers[message.guild.id].queue[0].author);
					break;
				}
		}
	}
})