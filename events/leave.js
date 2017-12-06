exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
    if(message.guild.me.voiceChannel){
        message.guild.me.voiceChannel.leave();
		server.Vconnection = null;
        server.queue = null;
    } else {
        message.channel.send('I\'m not in a voice channel...');
    }
}