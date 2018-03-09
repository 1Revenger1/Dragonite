const request = require('request');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const prettyMs = require('pretty-ms');

exports.run = async(client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
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
	
	console.log(isDisplay);
	
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
		
		let info = await ytdl.getInfo("www.youtube.com/watch?v=" + results.items[0].id.videoId);
		
		if(isDisplay){
			var searchEmbed = new Discord.MessageEmbed()
					.setColor('#E81F2F')
					.setTitle(info.title)
					.setImage(info.thumbnail_url)
					.setAuthor('Search result')
					.setURL("https://www.youtube.com/watch?v=" + results.items[0].id.videoId)
					.addField('Author', info.author.name)
					.addField('Length', prettyMs(info.length_seconds * 1000));		
			message.channel.send({embed : searchEmbed});
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
    });
}  