exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];

    if(isBeta){
        message.channel.send('Can\'t change prefix on beta!');
        return;
    }
    if(message.member.hasPermission('ADMINISTRATOR')){
        server.prefix = args[1];
        db.run('UPDATE servers SET prefix=\'' + args[1] + '\' WHERE serverid = ' + message.guild.id);
        message.channel.send('Bot prefix for the server changed to ' + server.prefix);
    } else {
        message.channel.send('You do not have the required permissions to change the prefix in this server. Requires Administrator'); //Timeout error
    }
}