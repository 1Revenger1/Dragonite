const bot = {};
const Discord = require('discord.js');
bot.client = new Discord.Client();
//const readline = require('readline');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { PlayerManager } = require("discord.js-lavalink");
bot.moment = require('moment-timezone');
bot.db = new sqlite3.Database('database.txt');
bot.fightDB = new sqlite3.Database('fightDB.txt');
bot.started = false;

const loginLocation = `../../../login.js`;
const Tokens = require(loginLocation);

const levels = {
	level_0: "Level 0 : Everyone",
	level_1: "MANAGE_ROLES",
	level_2: "MANAGE_GUILD",
	level_3: "Level 3 : Owner"
}

bot.version = '0-v8.3';
bot.versionBeta = '.1';
bot.checkLocation;
bot.isBeta = false;
bot.changeGameTimerOn = true;

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
		bot.changeGameTimerOn = false;
		bot.isBeta = true;
		bot.checkLocation = 'modulesBeta';
		break;
}

//lavalink
bot.nodes = [{ host:"10.0.0.67", port: 25569, region: "us-west", password: Tokens.lavalink() }]

var isTakingCommands = false;

var timer = 0;


function changeGame() {
    var games = ["with other sentient bots...what?",
             "Use '@Dragonite help' for commands",
             ("I'm in " + Object.keys(bot.servers).length + " guilds!"),
             "music for people!"]
    timer++;
    if(timer == games.length) timer = 0;
    
    bot.client.user.setActivity(games[timer]);
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
	if(bot.started){
		console.log("Ready event fired: " + new Date());
		return;
	}
	bot.started = true;
	
	bot.manager = new PlayerManager(bot.client, bot.nodes, {
		user: bot.client.user.id,
		shards: 1
	});

	bot.moment().tz("America/Los_Angeles").format();
	bot.commands = new Discord.Collection();
	bot.aliases = new Discord.Collection();
	bot.servers = {};

	bot.db.serialize(function() {
		var count = 0;
		var countAdditional = 0;
		console.log("Loading data for guilds...");

		bot.client.guilds.forEach(function(guild, id, map){
			bot.db.get("SELECT * FROM servers WHERE serverid=" + id, function(err, row){
				if(row == undefined){
					newGuild(guild);
					countAdditional++;
				}
			})
		});

		bot.db.each("SELECT * FROM servers", function(err, row) {
			var server = {};
			count++;
			if(bot.client.guilds.has(row.serverid)){
				bot.servers[row.serverid] = startUpInitForGuild(row, server);
			}

		}, function(err, rows) {
			console.log("Loading data for " + count + " guilds\nCreated data for " + countAdditional + " additional guilds");
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
				if(bot.changeGameTimerOn){
					setInterval(changeGame, 10000);
				} else {
					bot.client.user.setActivity("Release Canidate!");
				}
				isTakingCommands = true;
				//Parse restart
				const json = fs.readFileSync("./Restart.json");
				let restart = JSON.parse(json);
				if (restart != "") {
				  bot.client.channels.get(restart).send(`Dragonite restarted!\nLoaded data for ${count} guilds\nCreated data for ${countAdditional} additional guilds\nLoaded ${files.length} commands!`);
				  restart = "";
				  fs.writeFileSync("./Restart.json", JSON.stringify(restart, null, 3));
				}
			});
		});
	});
});

function newGuild(guild){
	bot.servers[guild.id] = {};
	var server = bot.servers[guild.id]
	bot.db.get("SELECT serverid FROM servers WHERE serverid = " + guild.id, function(err, row){
		if(row != undefined){
			console.log("Duplicate Server");
			return;
		} else {
			bot.db.run("INSERT INTO servers (serverid, volume) VALUES(" + guild.id +", 50)");

			server.prefix = '??';
			
			server.defaultMusic = null;
			bot.db.run("UPDATE servers SET defaultMusicID=null WHERE serverid = " + guild.id);
		}

		bot.db.get("SELECT * FROM servers WHERE serverid=" + guild.id, function(err, row){
			bot.servers[guild.id] = startUpInitForGuild(row, server);
		});
	});
}

function startUpInitForGuild(row, server){
	let guild = bot.client.guilds.get(row.serverid);
	server = {
		prefix: bot.isBeta ? "??b" : row.prefix,
		volume: row.volume,
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
	return server;
}

bot.client.on('guildCreate', guild => {
	bot.servers[guild.id] = newGuild(guild);
});

bot.client.on('guildDelete', guild => {
	bot.db.run("DELETE FROM servers WHERE serverid=" + guild.id);
	bot.servers[guild.id] = null;
});

bot.client.on('message', async message => {
    //Command Start
	if(message.channel.type == 'dm'){ //Sentience
		if(message.author.id == '139548522377641984'){
			if(message.content.startsWith("??portalInit")){
				var args = message.content.split(" ");
				try{
					bot.currentChannel = bot.client.channels.get(args[1]).createMessageCollector(message => message.member.id != bot.client.user.id);
					message.channel.send("Listening in to " + bot.client.channels.get(args[1]).name);	
				} catch (err){
					message.channel.send("Error getting channel");
					return;
				}
				bot.currentChannel.on('collect', m => bot.client.users.get('139548522377641984').send({embed: new Discord.MessageEmbed().setTitle(m.member.displayName).setColor(m.member.roles.color.hexColor).setDescription(m.content)}));
				return;
			}
			
			if(message.content.startsWith("??portalStop")){
				try{
					bot.currentChannel.stop();
					message.channel.send("Collector stopped");
				} catch(err){
					message.channel.send("No Collector to stop");
				}
				return;
			}

			if(bot.currentChannel && !bot.currentChannel.ended){
				try{
					bot.currentChannel.channel.send(message.content);
				} catch(err) {
					return;
				}
			}

		} else if(message.author.id == bot.client.user.id){
			return;
		} else {
			message.channel.send("Dragonite should not be used through DMs");
		}

	} else { //Everything else
		try{
			server = bot.servers[message.guild.id];
		} catch (err){
			Console.log("Error getting server from " + message.guild.id + " : " + message.guild.name);
		}

		//Edge case so that users can mention dragonite to get the prefix
		if(message.content.toLowerCase().indexOf(message.guild.me.toString()) !== -1 && message.content.toLowerCase().indexOf('prefix') !== -1 && message.member.id != bot.client.user.id && message.content.toLowerCase().indexOf('options') == -1){
			message.channel.send('Use `@' + message.guild.me.displayName + ' help` to see prefix and get help for commands');
			return;
		}

		//Sentience stuff
		if(message.author.id == '139548522377641984'){
			currentChannel = message.channel;
		}

		let args = message.content.split(" ");
		
        //Finally put in a check for if there is any content, lol
        if(!message.content){
            return;
        }
        
		//Stop running if Dragonite isn't mentioned or the prefix isn't used
		if(args[0].substring(0, server.prefix.length) != server.prefix && args[0] != message.guild.me.toString()){
			return;
		}

		if(!isTakingCommands){
			message.channel.send("Please wait one minute for Dragonite to start up, thanks!");
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

			if(command == undefined){
				return;
			}

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
			message.channel.startTyping();
			//Run the command
			await command.run(bot, message, args);

			message.channel.stopTyping();
		} catch (err){
			console.log(err.stack);
			message.channel.stopTyping();
			return;
		}
	}
});

bot.client.on('error', error => {
	// var stream = fs.createWriteStream('ConnectionError.log');
	// stream.once('open', fd => {
	// 	stream.write(bot.moment().format() + ":" + error.name + " -> " + error.message);
	// 	stream.end();
	// 	process.exit();
	// });
	console.log("Error: " + new Date() + " -> " + error.message + "\n" + error.stack);
});

bot.client.on('disconnect', error => {
	console.log("Disconnect: " + new Date());
});

bot.getRole = async function(type, v, g) {
	if (type == "id") {
	  return g.roles.get(v);
	} else if (type == "name") {
	  return g.roles.find(r => r.name.toLowerCase() === v.toLowerCase());
	}
}

bot.sleep = async function(millis) {
	return new Promise(resolve => setTimeout(resolve, millis));
}

bot.checkRoleExists = async function(type, v, g){
	if(type == "id"){
		return g.roles.exists('id', v);
	} else if (type == "name"){
		return g.roles.exists('name', v);
	}
}

bot.remainingTime = function(message){
	let server = bot.servers[message.guild.id];
	let totalTimeLeft = 0;

	//Get time left before adding new songs
	for(var i = 0; i < server.queue.length; i++){
		if(server.queue[i].stream) return -1;
		totalTimeLeft += server.queue[i].time;
	}

	if(server.player && server.player.playing){
		totalTimeLeft -= (Date.now() - server.player.timestamp);
	}
	return totalTimeLeft;
}

bot.gracefulShutdown = async function() {
	for(x in bot.servers){
		console.log("Server!");
		if(bot.servers[x].player){
			console.log("Player!");
			try{
				if(bot.servers[x].queue){
					console.log("Queue!");
					await bot.servers[x].queue[0].channel.send("Dragonite shutting down.");
				}
			} catch (err){
				console.log(err);
			}
			bot.manager.leave(x);
		}
	}

	console.log("Graceful Shutdown complete");
	process.exit();
}
process.on('SIGTERM', bot.gracefulShutdown);
process.on('SIGINT', bot.gracefulShutdown);


module.exports = { bot : bot,
				   levels : levels };
module.exports.tokens = function(){
	return Tokens;
}

//process.on('unhandledRejection', console.error);