const ytdl = require('ytdl-core');
const request = require('request');
const prettyMs = require('pretty-ms');

module.exports = {
    name: "play",
    aliases: [],    
    helpDesc: "Play a song or playlist from youtube.",
    helpTitle: "Play <youtube link/search terms>",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        const ytkey = require(`../Dragonite.js`).tokens().ytKey();

		if(!message.member.voiceChannelID || (message.guild.voiceConnection && message.member.voiceChannelID != message.guild.voiceConnection.channel.id)){
			message.channel.send("Please join a voice channel before requesting a song.\nYou must also be in the same voice channel as me");
			return
		}
		
		if(server.timeout){
			clearTimeout(server.timeout);
			server.timeout = null;
		}
		
        if(args.length < 2){
            message.channel.send("Please give a link/search term");
            return;
        }

        if(args[1].indexOf('youtube') < 0 && args[1].indexOf('youtu.be') < 0 && (args[1].indexOf('www') > -1 || args[1].indexOf('http') > -1)){
            message.channel.send("Invalid link");
            return;
        }

        if(args[1] && (args[1].indexOf('youtube') < 0) && (args[1].indexOf('youtu.be') < 0)){
            await require(`./search.js`).run(bot, message, args, true)
            return;
        }
    
        if(!server.queue) {
            server.queue = [];
        }
    
        var song = {};
        var nextPageToken;
        if(args[1].indexOf("playlist?list=") >= 0){
			let songErrorCount = 0;
            let playlistID = args[1].split('=');
			message.channel.send("Importing playlist - You may need to wait a minute for the music to start so we can buffer the playlist");
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
                                bot.commands.get("musicplay").run(bot, message, args, true);
                            }
			            } 
                    }
                    nextPageToken = playlist.nextPageToken;

                    if(nextPageToken != undefined){
                        requestPlaylist(playlistID, ytkey, nextPageToken, server, message);
                        return;
                    } else if(songErrorCount > 0 ) {
                        message.channel.send(songErrorCount + ' errors adding songs to the queue');
                    }

                    message.channel.send('Playlist imported to queue');
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
                
                var totalTimeLeft = 0;
                for(var i = 0; i < server.queue.length; i++){
                    totalTimeLeft += server.queue[i].time;
                }

                if(server.dispatcher){
                    totalTimeLeft -= server.dispatcher.totalStreamTime;
                }

                server.queue.push(song);
            
                message.channel.send(song.title + ' by ' + song.author + ' added to queue. Will be played in `' + prettyMs(totalTimeLeft, {secDecimalDigits: 0}) + '`');

                bot.commands.get("musicplay").run(bot, message, args, true);
            });
        }
    }
}
