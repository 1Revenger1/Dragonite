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
        
        if(!server.isPlaying){
            server.isPlaying = true;
            var streamOptions = { volume: server.volume };
            message.channel.send('Now playing ' + server.queue[0].title);
            try{
                server.dispatcher = server.Vconnection.playStream(ytdl(server.queue[0].url, {filter: "audioonly"}), streamOptions);
            } catch(err) {
                try{
                    console.log(err);
                    message.channel.send('Please have Dragonite join a channel first');
                } catch(err){
                    console.log('Oh noooos!');
                }
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