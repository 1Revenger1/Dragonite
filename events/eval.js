const Discord = require('discord.js');
module.exports = {
    name: "eval",
    aliases: [],
    permLevel: require(`../Dragonite.js`).levels.level_3,
    run: async (bot, message, args) => {
        dragonite = `../Dragonite.js`;
    
        const server = require(dragonite).bot.servers[message.guild.id];
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