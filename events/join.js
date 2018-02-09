exports.run = async(client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    

	
    if(message.member.voiceChannel) {
		if((server.defaultMusic != 'No music channel selected') && (message.member.voiceChannel.id != server.defaultMusic.id)){
			message.channel.send('The Admins have not allowed me to join this channel!');
			throw new Error('The Admins have not allowed me to join this channel!');
		}
	
		if(!message.member.voiceChannel.joinable){
			message.channel.send('I cannot join this voice channel!');
			throw new Error('I cannot join this voice channel!');
		}
		let connection = await message.member.voiceChannel.join();
		server.Vconnection = connection;
		message.reply('I have successfully connected to the channel!');
    } else {
        message.channel.send('You need to join a voice channel first!');
		throw new Error('You need to join a voice channel first!');
    }
}