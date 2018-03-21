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
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
		const ytkey = require(dragonite).tokens().ytKey();
	
		if(!server.queue) {
			server.queue = [];
		}
	
		if(!server.Vconnection && args[1].toLowerCase() != 'display'){ //checks if bot is in a voice channel
			try{
				await require(`./join.js`).run(client, message, args, isBeta, db);
			} catch(err) {
				return;
			}
		}
		
		let searchTerm = '';
		let isDisplay = (args[1].toLowerCase() == 'display');
		let startValue = 1;
		
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
			
			var infoArray = [];
			var whichResultString = results.pageInfo.resultsPerPage + " results. Please type " + server.prefix + "<number of result> to select which one you want to use\n\n";
			for(var i = 0; i < results.pageInfo.resultsPerPage; i++){
				let info = await ytdl.getInfo("www.youtube.com/watch?v=" + results.items[i].id.videoId);
				infoArray[i] = info;

				whichResultsString += (i + 1) + ") " + info.title + " by " + info.author.name + "\n";
			}

			const collector = message.channel.createMessageCollector(m => m.member.id == message.member.id, { time: 60000 });

			collector.on('collect', m => {
				if(m.content.substring(0, server.prefix.length) == server.prefix || m.content.substring(0, m.guild.me.toString() == m.guild.me.toString())){
					m.replace(server.prefix, "");
					m.replace(m.guild.me.toString(), "");

					try{
						var number = Number.parseInt(m);
						if(infoArray[number]){
							if(isDisplay){
								try {
									const newt = info.thumbnail_url.replace("default", "maxresdefault");
									await request(newt, async(error, response, body) => {
										info.thumbnail = error ? info.thumbnail_url.replace("default", "hqdefault") : newt;
										createEmbed(info, results.items[0].id.videoID, message);
									});
								} catch(e) {
									info.thumbnail = info.thumbnail_url.replace("default", "hqdefault");
									createEmbed(info, results.items[0].id.videoID, message);
								}
								
							} else {
								server.queue.push(song = {
									url: "https://www.youtube.com/watch?v=" + results.items[0].id.videoId,
										title: info.title,
										author: info.author.name,
										channel: message.channel,
										time: info.length_seconds * 1000
									});
								message.channel.send('Added ' + info.title + ' by ' + info.author.user + ' to the queue!');
								require(`./musicPlay.js`).run(client, message, args, isBeta, db, true);
							}	
							
							collector.stop('Selected');
						} else {
							throw new Error('Not a valid result');
						}
					} catch(err){
						message.channel.send(err);
					}
				}
			});

			collector.on('end', (collected, reason)){
				if(reason != 'Selected'){
					message.channel.send("Search selection timed out.");
				}
			}

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

