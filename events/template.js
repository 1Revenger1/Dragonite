exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
    message.channel.send("This is a template command for other commands. You shouldn't be seeing this...no really...you shouldn't.\nUgh fine, I\'ll give you some credits. Thanks a lot to the Coding Den and Discord.js guilds for their help, as well as John from the PNW FRC server.");
}