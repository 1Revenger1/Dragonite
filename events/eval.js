const Discord = require('discord.js');
module.exports = {
    name: "eval",
    aliases: [],    
    helpDesc: "Debugging for 1Revenger1",
    helpTitle: "Eval",
    cat: "admin",
    ignore: true,
    permLevel: require(`../Dragonite.js`).levels.level_3,
    run: async (bot, message, args) => {
        dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        var evalArgs = '';
        for(var i = 1; i < args.length; i++){
            evalArgs += args[i] + " ";
        }
        
        try {
          return message.channel.send(`\`\`\`js\n${eval(evalArgs)}\n\`\`\``);
        } catch (e) {
          return message.channel.send(`\`\`\`js\n${e.stack}\n\`\`\``);
        }    
    }
}