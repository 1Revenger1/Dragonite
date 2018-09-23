const Discord = require('discord.js');

module.exports = {
    name: "guildinfo",
    aliases: ["guild", "serverinfo", "server"],    
    helpDesc: "Information about this server",
    helpTitle: "Guildinfo",
    ignore: true,
    run: async (bot, message, args) => {
        let embed = new Discord.MessageEmbed();
        
        embed.addField("Name", message.guild.name, true);
        embed.addField("ID", message.guild.id,true);
        embed.addField("Created At", message.guild.createdAt.toUTCString(),true);
        //embed.addField("Vanity Code", await message.guild.fetchVanityCode(), true);
        embed.addField("Owner", message.guild.owner,true);
        embed.addField("Members", message.guild.memberCount, true);
        
        let botCount = message.guild.members.filter(member => member.user.bot == true).size;

        let categoryCount = 0;
        let textCount = 0;
        let voiceCount = 0;

        message.guild.channels.forEach((value, key, map) => {
            switch(value.type){
                case "text": textCount++; break;
                case "voice": voiceCount++; break;
                case "category": categoryCount++; break;
            }
        });

        embed.addField("Bots", botCount, true);
        embed.addField("Humans", message.guild.memberCount - botCount, true);
        embed.addField("Text Channels", textCount, true);
        embed.addField("Categories", categoryCount, true);
        embed.addField("Voice Channels", voiceCount, true);
        embed.addField("Roles", message.guild.roles.size, true);
        embed.addField("Emojis", message.guild.emojis.size, true);
        embed.addField("Region", message.guild.region, true);
        embed.addField("Icon URL", message.guild.iconURL());

        embed.setThumbnail(message.guild.iconURL());
        embed.setColor(message.guild.me.roles.color.hexColor);

        message.channel.send({embed : embed});

    }
}