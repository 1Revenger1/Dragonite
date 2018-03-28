const bot = {};
const Discord = require('discord.js');
bot.client = new Discord.Client();
//const readline = require('readline');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
bot.moment = require('moment-timezone');
bot.db = new sqlite3.Database('database.txt');

const loginLocation = `../../../login.js`;

const Tokens = require(loginLocation);

const levels = {
	level_0: "Level 0 : Everyone",
	level_1: "MANAGE_ROLES",
	level_2: "MANAGE_GUILD",
	level_3: "Level 3 : Owner"
}

bot.version = '0-v7.0.0';
bot.versionBeta = '.3';
bot.checkLocation;
bot.isBeta = false;

var myArgs = process.argv.slice(2);
switch(myArgs[0]){
	case '-r': bot.client.login(Tokens.releaseToken());
		bot.isBeta = false;
		bot.version = bot.version + ' Release';
		bot.checkLocation = 'modules';
		break;
	case '-b': bot.client.login(Tokens.betaToken());
		bot.version = bot.version + bot.versionBeta + ' Beta';
		bot.isBeta = true;
		bot.checkLocation = 'modulesBeta';
		break;
	case '-c': bot.client.login(Tokens.betaToken());
		bot.version = bot.version + ' Release Canidate';
		bot.isBeta = true;
		bot.checkLocation = 'modulesBeta';
		break;
}

var isTakingCommands = false;

var timer = 0;

function changeGame() {
	if(timer === 0){
		bot.client.user.setActivity('with other sentient bots...what?');
		timer = 1;
		return;
	}
	if(timer === 1){
		bot.client.user.setActivity('Use "@Dragonite help" for commands');
		timer = 2;
		return;
	}
	if(timer === 2){
		bot.client.user.setActivity('I\'m in ' + Object.keys(bot.servers).length + ' guilds!');
		timer = 0;
		return;
	}
}

bot.db.serialize(function() {
	bot.db.run("CREATE TABLE IF NOT EXISTS servers(serverid TEXT, prefix TEXT DEFAULT '??', volume TEXT DEFAULT 50,  levelsEnabled TEXT DEFAULT false, levelsAnnounceInDM TEXT DEFAULT false, levelupMsg TEXT DEFAULT 'Congrats, you have leveled up!', roleIDs TEXT, selfAssignOn TEXT DEFAULT false)");
	
	/*
	db.run("ALTER TABLE servers ADD COLUMN levelsEnabled");
	db.run("Alter Table servers ADD COLUMN levelsAnnounceInDM");
	db.run("ALTER TABLE servers ADD COLUMN levelUpMsg");
	db.run("ALTER TABLE servers ADD COLUMN roleIDs");
	db.run("ALTER TABLE servers ADD COLUMN selfAssignOn");
	db.run("ALTER TABLE servers ADD COLUMN defaultMusicID");
	bot.db.run("ALTER TABLE servers ADD COLUMN loggingChannelID INTEGER DEFAULT 0");
	bot.db.run("ALTER TABLE servers ADD COLUMN userJoinLogChannelID INTEGER DEFAULT 0");
	
	//Logging enabled, Channel, Emojis, Join, User, Message, Role
	bot.db.run("ALTER TABLE servers ADD COLUMN loggingEnabled TEXT DEFAULT 'false false false false false false false'");
	*/


});


bot.client.on('ready', () => {
	bot.moment().tz("America/Los_Angeles").format();
	bot.commands = new Discord.Collection();
	bot.aliases = new Discord.Collection();
	bot.servers = {};

	bot.db.serialize(function() {
		bot.db.each("SELECT * FROM servers", function(err, row) {
			var server = {};

			if(bot.client.guilds.has(row.serverid)){
				let guild = bot.client.guilds.get(row.serverid);
				server = {
					prefix: bot.isBeta ? "??b" : row.prefix,
					volume: row.volume/100,
					levelsEnabled: row.levelsEnabled,
					levelsAnnounceInDM: row.levelsAnnounceInLevels,
					levelUpMsg: row.levelUpMsg,
					selfAssignOn: row.selfAssignOn,
				}
	
				let loggingCommands = row.loggingEnabled.split(" ");
				server.loggingEnabled = loggingCommands[0];
				server.loggingChannel = loggingCommands[1];
				server.loggingEmoji = loggingCommands[2];
				server.loggingJoin = loggingCommands[3];
				server.loggingUser = loggingCommands[4];
				server.loggingMessage = loggingCommands[5];
				server.loggingRole = loggingCommands[6];

				if(row.loggingChannelID){
					console.log(row.loggingChannelID);
					server.logChannel = bot.client.guilds.get(row.serverid).channels.get(row.loggingChannelID);
				} else {
					server.defaultMusic = undefined;
				}

				if(row.userJoinLogChannelID){
					server.userLogChannel = bot.client.guilds.get(row.serverid).channels.get(row.userJoinLogChannelID);
				} else {
					server.userLogChannel = undefined;
				}

				if(row.defaultMusicID){
					server.defaultMusic = bot.client.guilds.get(row.serverid).channels.get(row.defaultMusicID);
				} else {
					server.defaultMusic = undefined;
				}

				if(row.roleIDs){
					server.roles = [];
					let roleIDs = row.roleIDs.split(" ");
					for(var i = 0; i < roleIDs.length - 1; i++){
						try{
							server.roles[i] = bot.client.guilds.get(row.serverid).roles.find('id', roleIDs[i]);
						} catch(err){
							//Do nothing if role does not exist
						}
					}
				}
			}

			bot.servers[row.serverid] = server;

		}, function(err, rows) {
			require(`./loggerPro.js`).run(bot);
			fs.readdir(bot.checkLocation, (err, files) => {
				if (err) return console.error(err);
				console.log("Loading " + files.length + " commands!");
				files.forEach(file => {
					var name = require(`./${bot.checkLocation}/${file}`).name.toLowerCase();
					bot.commands.set(name, require(`./${bot.checkLocation}/${file}`));
					require(`./${bot.checkLocation}/${file}`).aliases.forEach(alias => {
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

bot.client.on('guildCreate', guild => {
	var server = bot.servers[guild.id];
	bot.db.get("SELECT serverid FROM servers WHERE serverid = " + guild.id, function(err, row){
		if(row != undefined){
			return;
		} else {
			bot.db.run("INSERT INTO servers (serverid, volume) VALUES(" + guild.id +", 50)");

			server.prefix = '??';
			
			server.defaultMusic = "No music channel selected";
			bot.db.run("UPDATE servers SET defaultMusicID=null WHERE serverid = " + guild.id);
		}
	});
});

bot.client.on('guildDelete', guild => {
	bot.db.run("DELETE FROM servers WHERE serverid=" + guild.id);
});

bot.client.on('message', message => {
	if(!isTakingCommands && (message.content.indexOf(servers[message.guild.id].prefix) >= 0 || message.content.contains(message.guild.me.toString()))){
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
				message.channel.send('Error - Have you tried typing in a text channel?');
				return;
			}

		} else {
			message.channel.send("Dragonite should not be used through DMs");
		}

	}else { //Everything else
		server = bot.servers[message.guild.id];

		//Edge case so that users can mention dragonite to get the prefix
		if(message.content.toLowerCase().indexOf(message.guild.me.toString()) !== -1 && message.content.toLowerCase().indexOf('prefix') !== -1){
			message.channel.send('Use `@' + message.guild.me.displayName + ' help` to see prefix and get help for commands');
			return;
		}

		//Sentience stuff
		if(message.author.id == '139548522377641984'){
			currentChannel = message.channel;
		}

		let args = message.content.split(" ");
		
		//Stop running if Dragonite isn't mentioned or the prefix isn't used
		if(args[0].substring(0, server.prefix.length) != server.prefix && args[0] != message.guild.me.toString()){
			return;
		}
		
		try {
			if(args[0] == message.guild.me.toString()){
				args.shift();
			}
			//Get the command name itself
			var commandArg = args[0].replace(server.prefix, "").toLowerCase();
			
			//Check for aliases, and set commandArg to the full name if there are aliases
			if(bot.aliases.has(commandArg)) commandArg = bot.aliases.get(commandArg);

			var command = bot.commands.get(commandArg);

			//Check permissions to make sure the user can run the command
			if(command.permLevel && command.permLevel != levels.level_0){
				if(command.permLevel == levels.level_3 && message.member.id != '139548522377641984'){
					message.channel.send("This can only be run by the bot owner, 1Revenger1");
					return;
				}

				if(!message.member.hasPermission(command.permLevel) && command.permLevel != levels.level_3){
					message.channel.send("This can only be run by someone with the `" + command.permLevel + "` permission");
					return;
				}
			}

			//Run the command
			command.run(bot, message, args);
		} catch (err){
			return;
		}
	}
});

bot.client.on('error', error => {
	var stream = fs.createWriteStream('ConnectionError.log');
	stream.once('open', fd => {
		stream.write(bot.moment().format() + ":" + error.name + " -> " + error.message);
		stream.end();
		process.exit();
	});
});

bot.getRole = async function(type, v, g) {
	if (type == "id") {
	  return g.roles.get(v);
	} else if (type == "name") {
	  return g.roles.find(r => r.name.toLowerCase() === v.toLowerCase());
	}
}

bot.checkRoleExists = async function(type, v, g){
	if(type == "id"){
		return g.roles.exists('id', v);
	} else if (type == "name"){
		return g.roles.exists('name', v);
	}
}

module.exports = { bot : bot,
				   levels : levels };
module.exports.tokens = function(){
	return Tokens;
}

//process.on('unhandledRejection', console.error);