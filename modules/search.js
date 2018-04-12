const request = require('request');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const prettyMs = require('pretty-ms');

module.exports = {
	name: "search",
	helpDesc: "Search for songs on youtube. Ex: `??Search display Gas Gas Gas` (displays result rather than putting it into music queue)",
	helpTitle: "Search (optional: display) <search terms>",
	cat: "music",
    aliases: [],
    run: async (bot, message, args, dontDisplay) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
		const ytkey = require(dragonite).tokens().ytKey();
		
		if(!dontDisplay){
			dontDisplay = false;
		}

		let searchTerm = '';
		let isDisplay = (!dontDisplay);
		let startValue = 1;

		if(!server.queue) {
			server.queue = [];
		}
	
		if(!server.Vconnection && !isDisplay){ //checks if bot is in a voice channel
			try{
				await bot.commands.get("join").run(bot, message, args);
			} catch(err) {
				return;
			}
		}
		
		if(isDisplay){
			startValue++;
		}

		for(var i = startValue; i < args.length; i++){
			searchTerm += args[i] + " ";
		}
		
		request('https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=' + encodeURIComponent(searchTerm) + '&key=' + ytkey, async (error, response, body) => {
			var results = JSON.parse(body);
			if(error){
				console.log(error); 
				message.channel.send('There was an error');
			}
			if('error' in results) {
				message.channel.send('An error has occured...');
				return;
			} 
			if(results.items.length === 0) {
				message.channel.send('No results found. Please try using different terms');
				return;
			}			
			
			if(server.infoArray != null){
				message.channel.send("Search already running - Please wait before running the command again");
				return;
			}

			server.infoArray = [];
			var whichResultString = results.pageInfo.resultsPerPage + " results. Please type " + server.prefix + "<number of result> to select which one you want to use\n\n";
			for(var i = 0; i < results.pageInfo.resultsPerPage; i++){
				try{
					let info = await ytdl.getInfo("www.youtube.com/watch?v=" + results.items[i].id.videoId);;
					server.infoArray[i] = info;

					whichResultString += (i + 1) + ") " + info.title + " by " + info.author.name + "\n";
				} catch(err){
					console.log(err);
					server.infoArray[0] = null;
					whichResultString += (i + 1) + ") Error - Do not select";
				}
			}
			whichResultString += (results.pageInfo.resultsPerPage + 1) + ") Select to exit";

			message.channel.send(whichResultString);

			server.collector = message.channel.createMessageCollector(m => m.member.id == message.member.id, { time: 60000 });

			server.collector.on('collect', async m => {
				const server = require(`../Dragonite.js`).bot.servers[message.guild.id];
				if(m.content.substring(0, server.prefix.length) == server.prefix || 
				   m.content.substring(0, m.guild.me.toString() == m.guild.me.toString())){

					var mText = m.content.replace(server.prefix, "");
					mText = mText.replace(m.guild.me.toString(), "");

					try{
						var number = Number.parseInt(mText) - 1;
						if(number == 5){
							server.collector.stop('Selected');
							message.channel.send("Selection stopped");
							return;
						}

						if(server.infoArray[number] && server.infoArray[number] != null){

							var info = server.infoArray[number];
							server.collector.stop('Selected');

							if(isDisplay){
						
								try {
									const newt = info.thumbnail_url.replace("default", "maxresdefault");
									await request(newt, async(error, response, body) => {
										info.thumbnail = error ? info.thumbnail_url.replace("default", "hqdefault") : newt;
										createEmbed(info, results.items[number].id.videoID, message);
									});
								} catch(e) {
									info.thumbnail = info.thumbnail_url.replace("default", "hqdefault");
									createEmbed(info, results.items[number].id.videoID, message);
								}
								
							} else {
								var totalTimeLeft = 0;
								for(var i = 0; i < server.queue.length; i++){
									totalTimeLeft += server.queue[i].time;
								}
								server.queue.push(song = {
									url: "https://www.youtube.com/watch?v=" + results.items[number].id.videoId,
										title: info.title,
										author: info.author.name,
										channel: message.channel,
										time: info.length_seconds * 1000
									});
								message.channel.send('Added ' + info.title + ' by ' + info.author.user + ' to the queue! Will be played in `' + prettyMs(totalTimeLeft, {secDecimalDigits: 0}) + '`');
								bot.commands.get("musicplay").run(bot, message, args, true);
							}	
							
						} else {
							throw new Error('Not a valid result');
						}
					} catch(err){
						message.channel.send(err.message);
					}
				}
			});

			server.collector.on('end', (collected, reason) => {
				bot.servers[message.guild.id].infoArray = null;
				if(reason != 'Selected'){
					message.channel.send("Search selection timed out");
				}
			});

		});
    			
    }
}

function createEmbed(info, videoID, message){
	var searchEmbed = new Discord.MessageEmbed()
		.setColor('#E81F2F')
		.setTitle(info.title)
		.setImage(info.thumbnail)
		.setAuthor('Search result')
		.setURL("https://www.youtube.com/watch?v=" + videoID)
		.addField('Author', info.author.name)
		.addField('Length', prettyMs(info.length_seconds * 1000));		
	message.channel.send({embed : searchEmbed});
}

