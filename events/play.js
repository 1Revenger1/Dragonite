const ytdl = require('ytdl-core');
var ytkey = 'AIzaSyCJ5oL897AnJ6-TNzP_8C-kJZOoICv_5jE'; //Change to server specefic if added to more servers.
const request = require('request');

exports.run = (client, message, args, isBeta, db) => {
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

    if(!message.guild.me.voiceChannel){ //checks if bot is in a voice channel
        message.channel.send('The bot must be in a voice channel');
        return;
    }

    if(!server.queue) {
        server.queue = [];
    }

    var song = {};
    var nextPageToken;

    try{
        if(args[1].indexOf("playlist?list=") >= 0){
            let playlistID = args[1].split('=');
            var playlist = requestPlaylist(playlistID, ytkey, '', server, message);
            function requestPlaylist(playlistID, ytkey, nextPageToken, server, message){
                request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistID[1] + "&key=" + ytkey + "&pageToken=" + nextPageToken, (error, reponse, body) => {
                    var playlist = JSON.parse(body);
                    if('error' in playlist){
                        message.channel.send('Error getting playlist');
                        return;
                    } else if(playlist.items.length === 0){
                        message.channel.send('The playlist is empty!');
                        return;
                    } else {
                        var i = 0;
                        for(i; i < playlist.items.length; i ++){
                            song = {
                                url: "https://www.youtube.com/watch?v=" + playlist.items[i].snippet.resourceId.videoId,
                                title: playlist.items[i].snippet.title,
                                author: '(does not work with playlist)',
                                serverid: message.guild.id
                            }
                            server.queue.push(song);
                        } 
                    }
                    nextPageToken = playlist.nextPageToken;
                    console.log(nextPageToken);
                    if(nextPageToken != undefined){
                        requestPlaylist(playlistID, ytkey, nextPageToken, server, message);
                        return;
                    } else {
                        message.channel.send('Playlist imported to queue');
                        require(`./musicPlay.js`).run(client, message, args, isBeta, db, true);				
                    }
                });
            }

        } else {
            ytdl.getInfo(args[1], function(err, info) {
            song = {
                url: args[1],
                title: info.title,
                author: info.author.user,
                serverid: message.guild.id
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