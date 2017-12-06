const ytdl = require('ytdl-core');

exports.run = (client, message, args, isBeta, db, isPlayBot) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    if(!isPlayBot) {message.channel.send("This event is not supposed to be triggered standalone!");}
        
	if(!server.Vconnection){ //checks if bot is in a voice channel
        require(`./join.js`).run(client, message, args, isBeta, db);
    }
		
        if(!server.isPlaying){
            server.isPlaying = true;

            
            try{
                server.dispatcher = server.Vconnection.playStream(ytdl(server.queue[0].url, {filter: "audioonly"}));
				server.dispatcher.setVolume(server.volume);
				server.queue[0].channel.send('Now playing ' + server.queue[0].title);
            } catch(err) {
                console.log(err);
                message.channel.send('Error playing music - Try making sure Dragonite is in a voice channel');
                return;
            }
    
        } else {
            return;
        }

        server.dispatcher.on("end", () => {
            const server = require(dragonite).servers[message.guild.id];
			server.dispatcher = null;
            if(server.queue != null){
                server.queue.shift();
                if(server.queue[0]){
                    server.isPlaying = false;
                    require('./musicPlay.js').run(client, message, args, isBeta, db, true);
                } else {
                    server.isPlaying = false;
                    server.debounceSong = false;
                    message.channel.send('Playlist finished. Use ' + server.prefix + 'leave to have the bot leave the voice channel.');
					return;
                }
            } else {
				server.isPlaying = false;
                message.channel.send('Dragonite stopped and queue emptied');
				return;
            }
        }); 
}