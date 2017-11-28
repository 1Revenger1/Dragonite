const Discord = require('discord.js');
const client = new Discord.Client();
const opus = require('node-opus');
//const readline = require('readline');
const fs = require('fs');
const ytdl = require('ytdl-core');
const sqlite3 = require('sqlite3').verbose();
const request = require('request');

var db = new sqlite3.Database('database.txt')


var prefix = '!!';
var version = '0.6.1';
var versionBeta = '.0'
var pages;
var isBeta = false;

var myArgs = process.argv.slice(2);
switch(myArgs[0]){
	case '-r': client.login('MzYzNDc4ODk3NzI5MzM5Mzky.DLR5bA.gzQkMRSYjhSpuQryiGAOuiBGWVI');
		isBeta = false;
		version = version + ' Release';
		break;
	case '-b': client.login('MzY0OTc3MDY5MzEyMDQ5MTYz.DLXm7w.TPDa3918r1Y5deEu43Le_1cXI0k');
		version = version + versionBeta + ' Beta';
		isBeta = true;
		break;
	case '-c': client.login('MzY0OTc3MDY5MzEyMDQ5MTYz.DLXm7w.TPDa3918r1Y5deEu43Le_1cXI0k');
		version = version + ' Release Canidate';
		isBeta = true;
		break;
}



var tempStorage = {};
//ID, musicChannel, logChannel

var servers = {};

var isTakingCommands = false;

var timer = 0;

function changeGame() {
	if(timer === 0){
		client.user.setGame('with other sentient bots...what?');
		timer = 1;
		return;
	}
	if(timer === 1){
		client.user.setGame('Default prefix is ??');
		timer = 2;
		return;
	}
	if(timer === 2){
		client.user.setGame('I\'m in ' + Object.keys(servers).length + ' guilds!');
		timer = 0;
		return;
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
				volume: row.volume/100,
				levelsEnabled: row.levelsEnabled,
				levelsAnnounceInDM: row.levelsAnnounceInLevels,
				levelUpMsg: row.levelUpMsg,
				selfAssignOn: row.selfAssignOn
			}
			if(isBeta){
				servers[row.serverid].prefix = '??b';
			}

			if(row.roleIDs && client.guilds.exists('id', row.serverid)){
				servers[row.serverid].roles = [];
				let roleIDs = row.roleIDs.split(" ");
				for(var i = 0; i < roleIDs.length - 1; i++){
					//console.log(client.guilds.get('363798742857678859').name);
					//console.log(servers[row.serverid]);
					servers[row.serverid].roles[i] = client.guilds.get(row.serverid).roles.find('id', roleIDs[i]);
				}
			} else {
				servers[row.serverid].roles = [];
			}
		}, function(err, rows) {
			fs.readdir("./events/", (err, files) => {
				if (err) return console.error(err);
				files.forEach(file => {
					let eventFunction = require(`./events/${file}`);
					let eventName = file.split(".")[0];
					client.on(eventName, (...args) => eventFunction.run(client, ...args));
				})
				console.log('I am ready!');
				setInterval(changeGame, 10000);
				isTakingCommands = true;
			});
		})
	})
})

client.on('guildCreate', guild => {
	db.run("INSERT INTO servers (serverid, volume) VALUES(" + guild.id +", 0.50)");
	
	if(isBeta){
		servers[guild.id] = {
			prefix: '??b'
		};
	}

	servers[guild.id] = {
		prefix: '??'
	};
})

client.on('guildDelete', guild => {
	db.run("DELETE FROM servers WHERE serverid=" + guild.id);
})

function help(message){
	var embedGen = new Discord.RichEmbed()
		.setColor('#E81F2F')
		.setTitle('Dragonite Commands')
		//Fields
		.addField("Version", "Prints out the current version of Dragonite")
		.addField("Ping", "Return Dragonite\'s response time")
		.addField("Role <optional:Role Name>", "Will give a list of self-assignable roles unless you give it a role you want")
		.addField("HelpMusic", "Commands for music")
		.addField("HelpAdministrator", "Commands for Administrator")

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
		.addField("Options <optional:option> <optional:value>", "Allows Administrators to set server options")
		.addField("ChangePrefix <new prefix>", "Allows members with the Administrator permission to change the prefix for the server")
		.addField("Prefix", "Returns current prefix saved for this server");
				
	message.channel.send({embed: embedAdmin});
}

client.on('message', message => { 
	
	if(!isTakingCommands && message.content.indexOf(servers[message.guild.id].prefix) >= 0){
		message.channel.send("Please wait one minute for Dragonite to start up, thanks!");
		return;
	}

                      //Command Start
	if(message.guild === null){ //Sentience
		msgDM = message;
		if(message.author.id === '139548522377641984'){
			try{
				currentChannel.send(msgDM.content);
				return;
			} catch(err) {
				message.channel.send('You haven\'t typed in a guild yet you dumbo!');
				return;
			}

		}

	}else { //Everything else
		server = servers[message.guild.id];  
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
			return;
		}

		if((args[0].toLowerCase() == '??' + 'prefix')){
			message.channel.send('My prefix for this server is ' + servers[message.guild.id].prefix);
			return;
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
			case prefix + 'prefix':
				message.channel.send(prefix);
				break;
			case prefix + 'version':
				message.channel.send('Dragonite v' + version);
				break;
			//Voice Channel stuff
			case prefix + 'skip': //skips song
				if(servers[message.guild.id].dispatcher) {servers[message.guild.id].dispatcher.end();}
				break;

			case prefix + 'stop': //removes bot
				if(message.guild.voiceConnection){
				servers[message.guild.id].queue = null;
				message.guild.voiceConnection.disconnect();
				}
				break;

			case prefix + 'pause':
				if(message.guild.voiceConnection.dispatcher) {message.guild.voiceConnection.dispatcher.pause()};
				break;

			case prefix + 'resume':
			case prefix + 'unpause':
				if(message.guild.voiceConnection.dispatcher) message.guild.voiceConnection.dispatcher.resume();
				break;

			case prefix + 'volume': //sets volume

				db.run('UPDATE servers SET volume=' + args[1] + ' WHERE serverid=' + message.guild.id);
				servers[message.guild.id].volume = args[1]/100;
				try{
				servers[message.guild.id].dispatcher.setVolume(args[1]/100;
				}catch(err){
				console.log(err);
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
			default:
				try {
					if(args[0].substring(0, prefix.length) == prefix){
						let commandArg = args[0].split(prefix);
						let commandFile = require(`./events/${commandArg[1]}.js`);
						commandFile.run(client, message, args, isBeta, db);
					}
				} catch (err){
					//message.channel.send('That is not a command');
				}
				break;
		}
	}
})

module.exports = { servers : servers };