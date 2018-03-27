const Discord = require('discord.js');

module.exports = {
    name: "github",
    aliases: ["gh"],    
    helpDesc: "Github for Dragonite",
    helpTitle: "GitHub, GH",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        var githubEmbed = new Discord.MessageEmbed()
            .setColor('#E81F2F')
            .setAuthor('Github Repo for Dragonite' , bot.client.user.displayAvatarURL())
            .addField('Github for Dragonite:', 'https://github.com/1Revenger1/Dragonite');


        message.channel.send({embed : githubEmbed});
    }
}