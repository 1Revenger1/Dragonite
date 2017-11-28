exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
    if(message.member.voiceChannel) {
        message.member.voiceChannel.join()
            .then(connection => {
                server.Vconnection = connection;
                message.reply('I have successfully connected to the channel!');
            });
    } else {
        message.channel.send('You need to join a voice channel first!');
    }
}