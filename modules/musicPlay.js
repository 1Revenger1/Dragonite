const ytdl = require('ytdl-core');

module.exports = {
    name: "musicPlay",
    aliases: [],    
    helpDesc: "",
    helpTitle: "",
    ignore: true,
    run: async (bot, message, args, isPlayBot) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!isPlayBot) {message.channel.send("This event is not supposed to be triggered standalone!"); return;}
		
        if(!server.Vconnection){ //checks if bot is in a voice channel
            require(`./join.js`).run(bot, message, args);
        }
        
        if(!server.isPlaying){
            server.isPlaying = true;
            
            try{
                server.dispatcher = server.Vconnection.play(ytdl(server.queue[0].url, {begin: server.queue[0].begin}));
                server.dispatcher.setVolume(server.volume);
                server.queue[0].loop = 0;
                server.queue[0].channel.send('Now playing ' + server.queue[0].title);
            } catch(err) {
                console.log(err);
                message.channel.send('Error playing music - Try making sure Dragonite is in a voice channel');
                server.isPlaying = false;
                return;
            }
        
        } else {
            return;
        }

        server.dispatcher.on("end", () => {
            const server = require(dragonite).bot.servers[message.guild.id];
            server.isPlaying = false;
            server.dispatcher = null;
            
            if(server.queue === null){
                console.log(server.queue);
                message.channel.send('Dragonite stopped and queue emptied');
                return;
            }
            
            server.queue.shift();
            if(server.queue[0]){
                bot.commands.get("musicplay").run(bot, message, args, true);
            } else {
                message.channel.send('Playlist finished. Use ' + server.prefix + 'leave to have the bot leave the voice channel.');
                return;
            }
        });

        server.dispatcher.on("error", (err) =>{
            console.log(err);
        });
    }
}