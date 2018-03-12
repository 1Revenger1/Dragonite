const ytdl = require('ytdl-core');
const SC = require('node-soundcloud');
var ytkey = 'AIzaSyCJ5oL897AnJ6-TNzP_8C-kJZOoICv_5jE'; //Change to server specefic if added to more servers.
const request = require('request');

exports.run = async (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];

    if(!args[1]){ //checks if link is provided
        message.channel.send('Please provide a link...');
        return;
    }

	if((args[1].indexOf('youtube') < 0) && (args[1].indexOf('youtu.be') < 0)){
		message.channel.send('Please provide a link');
		return;
	}
	
	if(!server.Vconnection){ //checks if bot is in a voice channel
		try{
			await require(`./join.js`).run(client, message, args, isBeta, db);
		} catch(err) {
			return;
		}
    }

    if(!server.queue) {
        server.queue = [];
    }

    var song = {};
    var nextPageToken;

    try{
		//if(args[1].indexOf("soundcloud.com") >= 0){
			
		
		
		//	return;
		//}
	
        if(args[1].indexOf("playlist?list=") >= 0){
			let songErrorCount = 0;
            let playlistID = args[1].split('=');
			message.channel.send('Waiting to get information for playlist, please wait a minute or two fpr the music to start');
            var playlist = requestPlaylist(playlistID, ytkey, '', server, message);

            function requestPlaylist(playlistID, ytkey, nextPageToken, server, message){
                request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistID[1] + "&key=" + ytkey + "&pageToken=" + nextPageToken, async (error, reponse, body) => {
                    var playlist = JSON.parse(body);

                    if('error' in playlist){
                        message.channel.send('Error getting playlist');
                        return;
                    } else if(playlist.items.length === 0){
                        message.channel.send('The playlist is empty!');
                        return;
                    } else {
			for(let i = 0; i < playlist.items.length; i++){
				try{
					const info = await ytdl.getInfo("https://www.youtube.com/watch?v=" + playlist.items[i].snippet.resourceId.videoId);
					var song = {
						url: "https://www.youtube.com/watch?v=" + playlist.items[i].snippet.resourceId.videoId,
						title: playlist.items[i].snippet.title,
						author: info.author.name,
						channel: message.channel,
						time: info.length_seconds * 1000
					}
					
					if(server.queue){ //If ??stop is used before the queue import is finshed, stop queue import.
						server.queue.push(song);
					} else {
						return;
					}
				}catch(e){
					songErrorCount++;
					continue;
				}			

				if(i > 5){
					require(`./musicPlay.js`).run(client, message, args, isBeta, db, true);
				}
			} 
                    }
                    nextPageToken = playlist.nextPageToken;
                    if(nextPageToken != undefined){
                        requestPlaylist(playlistID, ytkey, nextPageToken, server, message);
                        return;
                    } else {
			if(songErrorCount >= 0 ) {
				message.channel.send(songErrorCount + ' errors adding songs to the queue');
			}
                        message.channel.send('Playlist imported to queue');
						
                    }
                });
            }

        } else {
            ytdl.getInfo(args[1], function(err, info) {
            song = {
                url: args[1],
                title: info.title,
                author: info.author.name,
		channel: message.channel,
		time: info.length_seconds * 1000
            }
			
	    if(args[2] && (args[2].indexOf('h|s|m|:') != 1)){
		song.begin = args[2];
	    } else {
		song.begin = 0;
	    }
			
            server.queue.push(song);
        
            message.channel.send(song.title + ' by ' + song.author + ' added to queue');

            require(`./musicPlay.js`).run(client, message, args, isBeta, db, true);
        })}
    } catch(e) {
            console.log(e.message);
            message.channel.send('Please use a real link...');
            server.queue.shift();
    }
}
