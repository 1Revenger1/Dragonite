const date = new Date();
const Discord = require('discord.js');
const client = new Discord.Client();
const opus = require('node-opus');
//const readline = require('readline');
const fs = require('fs');
const ytdl = require('ytdl-core');
const sqlite3 = require('sqlite3').verbose();
const request = require('request');
const prettyMs = require('pretty-ms');
const moment = require('moment-timezone');


const loginLocation = `../../../login.js`;

const db = new sqlite3.Database('database.txt')

const Tokens = require(loginLocation);

var prefix = '!!';
var version = '0.6.5';
var versionBeta = '.1';
var checkLocation;
var isBeta = false;

var myArgs = process.argv.slice(2);
switch(myArgs[0]){
	case '-r': client.login(Tokens.releaseToken());
		isBeta = false;
		version = version + ' Release';
		checkLocation = 'events';
		break;
	case '-b': client.login(Tokens.betaToken());
		version = version + versionBeta + ' Beta';
		isBeta = true;
		checkLocation = 'eventsBeta';
		break;
	case '-c': client.login(Tokens.betaToken());
		version = version + ' Release Canidate';
		isBeta = true;
		checkLocation = 'eventsBeta';
		break;
}
//ID, musicChannel, logChannel

var isTakingCommands = false;

var timer = 0;

function changeGame() {
	if(timer === 0){
		client.user.setActivity('with other sentient bots...what?');
		timer = 1;
		return;
	}
	if(timer === 1){
		client.user.setActivity('Default prefix is ??');
		timer = 2;
		return;
	}
	if(timer === 2){
		client.user.setActivity('I\'m in ' + Object.keys(servers).length + ' guilds!');
		timer = 0;
		return;
	}
}

db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS servers(serverid TEXT, prefix TEXT DEFAULT '??', volume TEXT DEFAULT 50, levelsEnabled TEXT DEFAULT false, levelsEnabled TEXT DEFAULT false, levelsAnnounceInDM TEXT DEFAULT false, levelupMsg TEXT DEFAULT 'Congrats, you have leveled up!', roleIDs TEXT, selfAssignOn TEXT DEFAULT false)");
	
	/*
	db.run("ALTER TABLE servers ADD COLUMN levelsEnabled");
	db.run("Alter Table servers ADD COLUMN levelsAnnounceInDM");
	db.run("ALTER TABLE servers ADD COLUMN levelUpMsg");
	db.run("ALTER TABLE servers ADD COLUMN roleIDs");
	db.run("ALTER TABLE servers ADD COLUMN selfAssignOn");
	db.run("ALTER TABLE servers ADD COLUMN defaultMusicID");
	*/

});


client.on('ready', () => {
	bot.commands = new Discord.Collection();
	bot.aliases = new Discord.Collection();
	bot.servers = {};

	moment().tz("America/Los_Angeles").format();
	db.serialize(function() {
		db.each("SELECT serverid, prefix, volume, levelsEnabled, levelsAnnounceInDM, levelUpMsg, roleIDs, selfAssignOn FROM servers", function(err, row) {
			var server = bot.servers[row.serverid];

			server = {
				prefix: row.prefix,
				volume: row.volume/100,
				levelsEnabled: row.levelsEnabled,
				levelsAnnounceInDM: row.levelsAnnounceInLevels,
				levelUpMsg: row.levelUpMsg,
				selfAssignOn: row.selfAssignOn,
				defaultMusic: null
			}

			if(isBeta){
				server.prefix = '??b';
			}

			if(row.defaultMusicID && client.guilds.exists('id', row.serverid)){
				try{
					server.defaultMusic = client.guilds.get(row.serverid).channels.find('id', row.defaultMusicID);
				} catch(err){
					server.defaultMusic = 'No music channel selected';
				}
			} else {
				server.defaultMusic = 'No music channel selected';
			}
			
			if(row.roleIDs && client.guilds.exists('id', row.serverid)){
				server.roles = [];
				let roleIDs = row.roleIDs.split(" ");
				for(var i = 0; i < roleIDs.length - 1; i++){
					//console.log(client.guilds.get('363798742857678859').name);
					//console.log(servers[row.serverid]);
					server.roles[i] = client.guilds.get(row.serverid).roles.find('id', roleIDs[i]);
				}
			} else {
				server.roles = [];
				server.selfAssignOn = 'false';
			}

		}, function(err, rows) {
			fs.readdir("./events/", (err, files) => {
				if (err) return console.error(err);
				console.log(`Loading ${files.length} commands!`);
				files.forEach(file => {
					var name = require(`./${checkLocation}/${file}`).name;
					//let eventName = file.split(".")[0];
					bot.commands.set(name, require(`./${checkLocation}/${file}`));
					require(`./${checkLocation}/${file}`).aliases.forEach(alias => {
						bot.aliases.set(alias, name);
					});
				});
				console.log('I am ready!');
				setInterval(changeGame, 10000);
				isTakingCommands = true;
			});
		});
	});
});

client.on('guildCreate', guild => {
	var server = bot.servers[guild.id];
	db.get("SELECT serverid FROM servers WHERE serverid = " + guild.id, function(err, row){
		if(row != undefined){
			return;
		} else {
			db.run("INSERT INTO servers (serverid, volume) VALUES(" + guild.id +", 50)");
	
			if(isBeta){
				server = {
					prefix: '??b'
				};
			}

			server = {
				prefix: '??'
			}
			
			server.defaultMusic = "No music channel selected";
			db.run("UPDATE servers SET defaultMusicID=null WHERE serverid = " + guild.id);
		}
	});
});

client.on('guildDelete', guild => {
	db.run("DELETE FROM servers WHERE serverid=" + guild.id);
});

function runOtherEvent(otherEvent, message){
	require(`./otherEvents/${otherEvent}.js`).run(client, message, isBeta, db);
}

client.on('message', message => {
	if(!isTakingCommands && message.content.indexOf(servers[message.guild.id].prefix) >= 0){
		message.channel.send("Please wait one minute for Dragonite to start up, thanks!");
		return;
	}

    //Command Start
	if(message.channel.type == 'dm'){ //Sentience
		if(message.author.id == '139548522377641984'){
			try{
				currentChannel.send(message.content);
				return;
			} catch(err) {
				message.channel.send('You haven\'t typed in a guild yet you dumbo!');
				return;
			}

		} else {
			message.channel.send("Dragonite should not be used through DMs");
		}

	}else { //Everything else
		server = bot.servers[message.guild.id];  
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

		if(server.prefix){
			prefix = server.prefix;
		}

		if(message.author.id == '139548522377641984'){
			currentChannel = message.channel;
		}

		let args = message.content.split(" ");
		if((args[0].toLowerCase() == '??' + 'changeprefix') && (message.member.hasPermission('ADMINISTRATOR'))){
			server.prefix = args[1];
			db.run('UPDATE servers SET prefix=\'' + args[1] + '\' WHERE serverid = ' + message.guild.id);
			message.channel.send('Used default prefix to set server prefix to ' + servers[message.guild.id].prefix);
			return;
		}

		if((args[0].toLowerCase() == '??' + 'prefix')){
			message.channel.send('My prefix for this server is ' + servers[message.guild.id].prefix);
			return;
		}
		
		if(message.content.toLowerCase().indexOf('<@363478897729339392>') !== -1 && message.content.toLowerCase().indexOf('prefix') !== -1){
			message.channel.send('The prefix for this server is: ' + servers[message.guild.id].prefix);
		}
		
		if(args[0].substring(0, prefix.length) !== prefix){
			return;
		}
		
		switch(args[0].toLowerCase()){
			case prefix + 'prefix':
				message.channel.send(prefix);
				break;
			case prefix + 'version':
				message.channel.send('Dragonite v' + version);
				break;
			//Voice Channel stuff

			case prefix + 'stop': //removes bot
				if(!message.member.hasPermission("MANAGE_GUILD")) {message.reply('You do not have perms to use the Stop command!'); return;}
				if(message.guild.voiceConnection){
					servers[message.guild.id].queue = null;
					message.guild.voiceConnection.disconnect();
					servers[message.guild.id].Vconnection = null;
				}
				break;

			case prefix + 'pause':
				if(message.guild.voiceConnection.dispatcher) {message.guild.voiceConnection.dispatcher.pause()};
				break;

			case prefix + 'resume':
			case prefix + 'unpause':
				if(message.guild.voiceConnection.dispatcher) message.guild.voiceConnection.dispatcher.resume();
				break;
			case prefix + 'np':
			case prefix + ('nowplaying'):
				runOtherEvent('nowPlaying', message);
				break;
			default:
				try {
					let commandArg = args[0].split(prefix);
					let commandFile = require(`./${checkLocation}/${commandArg[1]}.js`);
					commandFile.run(client, message, args, isBeta, db);
				} catch (err){
					//console.log(err);
					//message.channel.send('That is not a command');
				}
				break;
		}
	}
})

process.on('error', error => {
	var stream = fs.createWriteStream('ConnectionError.log');
	stream.once('open', fd => {
		stream.write(moment().format() + ":" + error.name + " -> " + error.message);
		stream.end();
		process.exit();
	});
});

module.exports = { servers : servers };
module.exports.tokens = function(){
	return Tokens;
}

//process.on('unhandledRejection', console.error);