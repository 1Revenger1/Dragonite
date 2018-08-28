const fs = require('fs');

module.exports = {
    name: "restart",
    aliases: ["exit"],    
    helpDesc: "Restarts the bot",
    helpTitle: "Restart",
    ignore: true,
    permLevel: require(`../Dragonite.js`).levels.level_3,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];

        message.reply("Reply with `Yes` or `No` to confirm/deny Dragonite restart.");
        
        bot.collector = message.channel.createMessageCollector(m => m.member.id == message.member.id, { time: 60000 });
        
        bot.collector.on('collect', async m => {
            if(m.content.toLowerCase() == "yes"){
                await message.channel.send("Restarting Dragonite...");
                let restart = JSON.parse(fs.readFileSync("./Restart.json"));
                restart = m.channel.id;
                fs.writeFileSync("./Restart.json", JSON.stringify(m.channel.id, null, 3));
                bot.gracefulShutdown();
            } else if(m.content.toLowerCase() == "no"){
                bot.collector.stop("Selected no - Ending selection")
            }
        });

        bot.collector.on('end', (collected, reason) => {
            if(reason != "Selected no - Ending selection"){
                message.channel.send("Restart timer timed out");
            } else {
                message.channel.send(reason);
            }
        });
    }
}