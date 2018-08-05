const ytdl = require('ytdl-core');
const youtube = require('youtube-dl');

module.exports = {
    name: "musicPlay",
    aliases: [],    
    helpDesc: "",
    helpTitle: "",
    ignore: true,
    run: async (bot, message, args, isPlayBot) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!isPlayBot) {message.channel.send("This event is not supposed to be triggered by a user!"); return;}
		
        if(!message.guild.voiceConnection){ //checks if bot is in a voice channel
            await require(`./join.js`).run(bot, message, args);
        }
        
        if(!server.isPlaying){
            server.isPlaying = true;
            
            try{
                // {begin: server.queue[0].begin
                server.dispatcher = message.guild.voiceConnection.play(youtube(server.queue[0].url, ['-x']));
                server.dispatcher.setVolume(server.volume);
                server.queue[0].loop = 0;
                server.queue[0].channel.send('Now playing ' + server.queue[0].title);
            } catch(err) {
                console.log(err.stack);
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
                message.channel.send('Dragonite stopped and queue emptied');
                return;
            }
            
            server.queue.shift();
            if(server.queue[0]){
                bot.commands.get("musicplay").run(bot, message, args, true);
            } else {
                server.timeout = setTimeout(emptyQueueHandeler, 180000, server, message); //(60000ms) 1 minute timeout before leaving if nothing else is queued.
                message.channel.send('Playlist finished. Use ' + server.prefix + 'leave to have the bot leave the voice channel.');
                return;
            }
        });

        server.dispatcher.on("error", (err) =>{
            console.log(err.stack);
        });

        //Handles an empty queue - May eventually play from a list of music predifined in a db?
        async function emptyQueueHandeler(server, message){
            try{
                if((server.isPlaying) || (server.queue && server.queue.length > 0)){
                    return;
                }
            } catch (err) {
                console.log(err.stack);
            }


            if(message.guild.voiceConnection){
                try {
                    message.channel.send("Disconnected from `" + message.guild.voiceConnection.channel.name + "` due to lack of queued songs.");
                    message.guild.voiceConnection.disconnect();
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
}

