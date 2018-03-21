module.exports = {
    name: "template",
    aliases: [],    
    helpDesc: "a template for other commands",
    helpTitle: "template",
    ignore: true,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        message.channel.send("This is a template command for other commands. You shouldn't be seeing this...no really...you shouldn't.\nUgh fine, I\'ll give you some credits. Thanks a lot to the Coding Den and Discord.js guilds for their help, as well as John from the PNW FRC server and those from the FRC Development Discord and Fire's Dev Group!");
    }
}