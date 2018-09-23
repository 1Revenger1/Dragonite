const Discord = require('discord.js');

module.exports = {
    name: "userinfo",
    aliases: ["user"],    
    helpDesc: "Get information on a user",
    helpTitle: "Userinfo <Optional: User mention>",
    run: async (bot, message, args) => {
        let embed = new Discord.MessageEmbed();

        let member = message.member;
        if(message.mentions.members.size > 0 && !message.mentions.everyone) member = message.mentions.members.first();
        
        embed.addField("Name", member.user.username, true);
        embed.addField("Nickname", member.displayName, true);
        embed.addField("Joined Discord", member.user.createdAt.toUTCString(), true);
        embed.addField("ID", member.id, true);
        embed.addField("Joined guild", member.joinedAt.toUTCString(), true);


        let joinOrder = 1;
        message.guild.members.forEach((x, key, map) => {
            if(member.joinedTimestamp > x.joinedTimestamp){
                joinOrder++;
            }
        });

        embed.addField("Join order", joinOrder, true);
        embed.addField("Status", member.user.presence.status, true);
        embed.addField("Activity", member.user.presence.activity ? member.user.presence.activity.name : "N/A", true);
        embed.addField("Hoist Role", member.roles.hoist, true);
        embed.addField("Highest Role", member.roles.highest, true);
        embed.addField("Color Role", member.roles.color, true);
        embed.addField("Color Role Hexcode", member.roles.color.hexColor, true);
        
        let roleStr = "";
        let roleCount = 0;

        member.roles.forEach((value, key, map) => {
            roleCount++;
            if(roleCount <= 21 && roleCount > 1) roleStr += value.toString() + " ";
        });

        if(roleCount > 21) roleStr += (roleCount - 21) + " more roles...";

        embed.addField("Roles [ " + roleCount - 1 + " ]", roleStr);
        embed.addField("Icon URL", member.user.displayAvatarURL());
        embed.setColor(member.roles.color.hexColor);

        embed.setThumbnail(member.user.displayAvatarURL());

        message.channel.send({embed : embed});


    }
}