exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    var ping1 = message.createdTimestamp;
    message.channel.send('Pinging...').then((msg) =>{
        var ping2 = msg.createdTimestamp - ping1;
        try{
            msg.edit('Pong! Ping was ' + ping2 + ' ms. The Heartbeat was ' + client.ping.toFixed(1) + ' ms.');
        } catch(err) {
            message.edit('Pinging... That didn\'t quite work.');
        }
    })    
}