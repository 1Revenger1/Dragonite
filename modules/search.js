const request = require('request');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const prettyMs = require('pretty-ms');
const fetch = require('snekfetch');

module.exports = {
	name: "search",
	helpDesc: "Search for songs on youtube and display results. Ex: `??Search Gas Gas Gas` ",
	helpTitle: "Search <search terms>",
	cat: "music",
    aliases: [],
    run: async (bot, message, args, dontDisplay) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
		const lavalinkKey = require(dragonite).tokens().lavalink();
		
		if(!dontDisplay){
			dontDisplay = false;
		}

		let searchTerm = 'ytsearch:';
		let isDisplay = (!dontDisplay);
		let startValue = 1;

		if(!server.queue) {
			server.queue = [];
		}
		
		if(isDisplay){
			startValue++;
		}

		for(var i = startValue; i < args.length; i++){
			searchTerm += args[i] + " ";
		}

		let searchMessage = await message.channel.send("Currently searching... Please wait for a few seconds.");
		
		let res = await fetch.get(`http://10.0.0.67:30000/loadtracks`)
			.query({ identifier: searchTerm})
			.set("Authorization", lavalinkKey)
			.catch(err => {
				return message.channel.send("Error occured: " + err);
			});
		
		if (!res) return message.channel.send("Error!");
		if (!res.body.tracks) return message.channel.send("No songs found");
		


		let resultNum = (res.body.tracks.length >= 5 ? 5 : res.body.tracks.length);
		//Hey hey, uri for url...
		let whichResultString = resultNum + " results. Please type the number for the result you want.\n\n";
		
		for(let i = 0; i < resultNum ; i++){
			whichResultString += (i + 1) + ") " + res.body.tracks[i].info.title + " by " + res.body.tracks[i].info.author + "\n";
		}

		whichResultString += (resultNum + 1)  + ") Select to exit selection";
		searchMessage.edit(whichResultString);

		//Look for user response
		message.collector = message.channel.createMessageCollector(m => m.member.id == message.member.id, { time: 60000 });

		//Where we parse user response
		message.collector.on('collect', async m => {
			let userResponse;
			try{
				userResponse = parseInt(m.content) - 1;
				if(!Number.isInteger(userResponse) || userResponse > resultNum || userResponse < 0) throw "Not a valid number";
			} catch (err) {
				return message.channel.send("Not a valid response. Make sure to respond with the number you want");
			}
			
			//If you have reached this point, a proper response has been made.
			message.collector.stop("Selected");

			if(userResponse == resultNum) return message.channel.send("Canceling search");

			let songRes = res.body.tracks[userResponse];
            let song = {
                url: songRes.info.uri,
                track: songRes.track,
                title: songRes.info.title,
                author: songRes.info.author,
                channel: message.channel,
                time: songRes.info.length,
                stream: songRes.info.isStream
            }

			if(isDisplay) return createEmbed(song, message);

			server.queue.push(song);

			let totalTimeLeft = bot.remainingTime(message);
			let timeString = totalTimeLeft == -1 ? "Unknown - Stream in queue" : prettyMs(totalTimeLeft, {secDecimalDigits: 0});

            message.channel.send(song.title + ' by ' + song.author + ' added to queue. Will be played in `' + timeString + '`');
			bot.commands.get("musicplay").run(bot, message, args, true);
		});

		message.collector.on('end', (collected, reason) => {
			if(reason != 'Selected'){
				message.channel.send("Search selection timed out");
			}
		});		
    }
}

function createEmbed(song, message){
	var searchEmbed = new Discord.MessageEmbed()
		.setColor('#E81F2F')
		.setTitle(song.title)
		.setAuthor('Search result')
		.setURL(song.url)
		.addField('Author', song.author);

		if(!song.stream){
			searchEmbed.addField('Length', prettyMs(song.time, {secDecimalDigits: 0}));
		} else {
			searchEmbed.addField('Length', "Unknown - This is a stream");	
		}
	message.channel.send({embed : searchEmbed});
}

