module.exports = {
    name: "join",
    aliases: [],    
    helpDesc: "Called automatically with Play and Search. Has the bot join the user's voice channel",
	helpTitle: "Join",
	cat: "music",
	ignore: true,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(message.member.voiceChannel) {
			if((server.defaultMusic != null) && (message.member.voiceChannel.id != server.defaultMusic.id)){
				message.channel.send('I am not allowed to join `' + message.member.voiceChannel.name + '`');
				throw new Error('The Admins have not allowed me to join this channel');
			}
		
			if(!message.member.voiceChannel.joinable){
				message.channel.send('I cannot join this voice channel!');
				throw new Error('I cannot join this voice channel!');
			}
			let connection = await message.member.voiceChannel.join();
			server.Vconnection = connection;
			message.reply('I have successfully connected to `' + message.member.voiceChannel.name + '`');
		} else {
			message.channel.send('You need to join a voice channel first');
			throw new Error('You need to join a voice channel first');
		}
	}
}