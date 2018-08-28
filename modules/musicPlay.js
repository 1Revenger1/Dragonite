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
        
        if(!isPlayBot) {message.channel.send("This event is not supposed to be triggered by a user!"); return;}
		
        if(!server.player){ //checks if bot is in a voice channel
            await require(`./join.js`).run(bot, message, args);
        }
        
        if(!server.player.playing){
            try{
                server.player.play(server.queue[0].track);
                server.player.volume(server.volume);
                server.queue[0].loop = 0;
                server.queue[0].channel.send('Now playing ' + server.queue[0].title);
            } catch(err) {
                console.log(err.stack);
                message.channel.send('Error playing music - Try making sure Dragonite is in a voice channel');
                return;
            }
        
        } else {
            return;
        }
    }
}

