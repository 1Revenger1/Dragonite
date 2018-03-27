module.exports = {
    name: "reload",
    aliases: [],    
    helpDesc: "Reloads commands when I edit them",
    helpTitle: "Reload",
    ignore: true,
    permLevel: require(`../Dragonite.js`).levels.level_3,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;

        const server = bot.servers[message.guild.id];

        if(!args || args.size < 1) return message.reply("You must provide a command name to reload.");
        
        try{
            bot.commands.delete(args[1]);
            delete require.cache[require.resolve(`./${args[1]}.js`)];
            var name = require(`./${args[1]}.js`).name.toLowerCase();
            bot.commands.set(name, require(`./${args[1]}.js`));
            message.reply("The command `" + args[1] + "` has been reloaded");
        }catch(err){
            console.log(err);
            message.channel.send("Please use a real command name");
        }
    }
}