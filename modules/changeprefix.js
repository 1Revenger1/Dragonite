module.exports = {
    name: "changeprefix",
    aliases: [],
    permLevel: require(`../Dragonite.js`).levels.level_2,
    helpDesc: "Change how you call Dragonite for this guild",
    helpTitle: "ChangePrefix <new prefix>",
    cat: "admin",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(bot.isBeta){
            message.channel.send('Can\'t change prefix on beta!');
            return;
        }
    
        server.prefix = args[1];
        bot.db.run('UPDATE servers SET prefix=\'' + args[1] + '\' WHERE serverid = ' + message.guild.id);
        message.channel.send('Bot prefix for the server changed to ' + server.prefix);
    }
}