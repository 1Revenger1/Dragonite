const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const prettyMs = require('pretty-ms');

module.exports = {
    name: "nowplaying",
    aliases: ["np"],    
    helpDesc: "Shows the song currently playing, if one is playing",
	helpTitle: "NowPlaying, NP",
	cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
		if(!server.player.playing){
			message.channel.send('Currently not playing anything');
			return;
		} else {
			var progressString = '    | ';
			var x = 0;
			
			if(!server.queue[0].stream){
				for(var i = 0; i < Math.round((Date.now() - server.player.timestamp) / server.queue[0].time * 10); i++){
					progressString += '\u258A';
					x++;
				}
				
				for(var i = 0; i < (10 - x); i++){
					progressString += '\u2014';
				}

			} else {
				progressString += "Unknown - Watching stream";
			}

			progressString += ' |';
			
			var optionsEmbed = new Discord.MessageEmbed()
				.setColor('#E81F2F')
				.setTitle(server.queue[0].title)
				.setAuthor('Now playing')
				.setURL(server.queue[0].url)
				.addField('Author', server.queue[0].author);
			
			if(!server.queue[0].stream){
				optionsEmbed.addField('Progress', prettyMs((Date.now() - server.player.timestamp), {secDecimalDigits: 0}) + ' / ' + prettyMs(server.queue[0].time, {secDecimalDigits: 0})
					+ progressString);
			} else {
				optionsEmbed.addField('Progress', progressString);
			}

				

			message.channel.send({embed : optionsEmbed});
		}
    }
}