const Discord = require('discord.js');
const client = new Discord.Client();
const opus = require('node-opus');
//const readline = require('readline');
const fs = require('fs');
const ytdl = require('ytdl-core');
const sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('database.txt')

client.login('');

var prefix = '!!';
var version = '0.2.2';
var pages;
//ID, musicChannel, logChannel

var servers = {};

var timer = 0;

function changeGame() {
	if(timer === 0){
		client.user.setGame('with other sentient bots...what?');
		timer = 1;
	}
	if(timer === 1){
		client.user.setGame('Default prefix is ??');
		timer = 0;
	}
}

db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS servers(serverid TEXT, prefix TEXT DEFAULT \'??\', volume TEXT DEFAULT 0.5)");

	db.each("SELECT serverid, prefix FROM servers", function(err, row) {
		servers[row.serverid] = {
			prefix: row.prefix,
			volume: row.volume
		}
	});
});

client.on('ready', () => {
	console.log('I am ready!');
	setInterval(changeGame, 10000);
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
		var streamOptions = { volume: server.volume }
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
			server.queue.shift();
			
			if(server.queue[0]){
				server.isPlaying = false;
				play(message);
			} else {
				server.isPlaying = false;
				server.debounceSong = false;
				message.channel.send('Playlist finished. Use ' + servers[message.guild.id].prefix + 'leave to have the bot leave the voice channel.');
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
		.addField("Play <URL>", "Streams music from youtube link to voice channel Dragonite is in and adds it to the queue")
		.addField("Skip", "Skips the current song")
		.addField("Stop", "Stops Dragonite streaming and forces it to leave the voice channel")
		.addField("Pause", "Pauses playback of the stream")
		.addField("Resume", "Resumes playback of the stream")
		.addField("Queue", "Returns the current queue")
		.addField("Volume <number out of 100>", "Changes the volume of playback. Only applies when next video begins");

	message.channel.send({embed: embedMus});
}

function helpAdmin(message){
	var embedAdmin = new Discord.RichEmbed()
		.setColor('#E81F2F')
		.setTitle('Administrative Commands')
		//Administrative Commands
		.addField("ChangePrefix <new prefix>", "Allows members with the Administrator permission to change the prefix for the server")
		.addField("Prefix", "Returns current prefix saved for this server");
				
	message.channel.send({embed: embedAdmin});
}

client.on('message', message => {
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

	if(servers[message.guild.id].prefix){
		prefix = servers[message.guild.id].prefix;
	}

	if(message.author.id === '139548522377641984'){
		currentChannel = message.channel;
	}


	let args = message.content.split(" ");
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
			} else {
				message.channel.send('I\'m not in a voice channel...');
			}
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

			try{
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
			})} catch(e) {
				message.channel.send('Please use a real link...');
				servers[message.guild.id].queue.shift();
			}

			break;
		case prefix + 'skip': //skips song
			if(servers[message.guild.id].dispatcher) servers[message.guild.id].dispatcher.end();
			break;

		case prefix + 'stop': //removes bot
			if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
			break;

		case prefix + 'pause':
			if(message.guild.voiceConnection) message.guild.voiceConnection.dispatcher.pause();
			break;

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
			for(var page = 0; page < pages; page++){
				var queueS = '';
				for(var songn = 0; songn + 10 * (page) < (servers[message.guild.id].queue.length) && songn < 10; songn++){
					queueS += '`[' + (songn + 10 * (page) + ']` ' + servers[message.guild.id].queue[songn + 10 * (page)].title + ' by ' + servers[message.guild.id].queue[songn + 10 * (page)].author + '\n');
				}
				message.channel.send('Page **' + (page + 1) + '** of **' + pages + '**\n\n' + queueS);
			}			
		} else {
			message.channel.send('Queue has not been created yet');
		}

			break;
		case prefix + ('nowplaying'||'np'):
		if(!servers[message.guild.id].isPlaying){
			break;
		} else {
			message.channel.send('Currently playing ' + servers[message.guild.id].queue[0].title + ' by ' + servers[message.guild.id].queue[0].author);
			break;
		}
	}
}})