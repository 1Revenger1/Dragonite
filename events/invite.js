exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
    message.channel.send("Here is the invite link to allow me to join your server: https://discordapp.com/oauth2/authorize?client_id=363478897729339392&scope=bot&permissions=0x10000000");
}