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
        
		if(!server.isPlaying){
			message.channel.send('Currently not playing anything');
			return;
		} else {
			message.channel.startTyping();
			const info = ytdl.getInfo(server.queue[0].url)
				.then(info => {
					var progressString = '    | ';
					var x = 0;
					
					for(var i = 0; i < Math.round(server.dispatcher.streamTime / server.queue[0].time * 10); i++){
						progressString += '\u258A';
						x++;
					}
					
					for(var i = 0; i < (10 - x); i++){
						progressString += '\u2014';
					}
					
					progressString += ' |';
					
					var optionsEmbed = new Discord.MessageEmbed()
						.setColor('#E81F2F')
						.setTitle(server.queue[0].title)
						.setThumbnail(info.thumbnail_url)
						.setAuthor('Now playing')
						.setURL(server.queue[0].url)
						.addField('Author', server.queue[0].author)
						.addField('Progress', prettyMs(server.dispatcher.streamTime, {secDecimalDigits: 0}) + ' / ' + prettyMs(server.queue[0].time, {secDecimalDigits: 0})
							+ progressString);
						
	
					message.channel.send({embed : optionsEmbed});
					message.channel.stopTyping();
				});
		}
    }
}