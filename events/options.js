const Discord = require('discord.js');

exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    var server = require(dragonite).servers[message.guild.id];

    function callOptionsEmbed(rolesOn){
        var optionsEmbed = new Discord.MessageEmbed()
            .setColor('#E81F2F')
            .setAuthor('Options for ' + message.guild.name, message.guild.iconURL)
            .addField('Self-Assignable Roles (\'role\')', 'Enabled: ' + rolesOn + '\nHas permission \'MANAGE_ROLES\': ' + client.guilds.get(message.guild.id).me.hasPermission("MANAGE_ROLES"));

        message.channel.send({embed : optionsEmbed});
    }   

    if(!message.member.hasPermission('ADMINISTRATOR')){
        message.channel.send("You do not have the perms to change server settings for Dragonite");
        return;
    }
    if(!args[1]){
        if(!server.selfAssignOn){
            server.selfAssignOn = false;
        }
        var rolesOn = server.selfAssignOn;
        callOptionsEmbed(rolesOn);
        message.channel.send("Use \"" + server.prefix + "options (name in Parenthesis) (true or false)\" to turn that option on or off");
        return;
    }
    
    switch(args[1]){
        case "role":
            if(args[2] == "true"){
                server.selfAssignOn = 'true';
                db.run("UPDATE servers SET selfAssignOn=\'true\' WHERE serverid = " + message.guild.id);
                message.channel.send("Self-Assignable Roles were enabled!");
            } else if(args[2] == "false"){
                server.selfAssignOn = 'false';
                db.run("UPDATE servers SET selfAssignOn=\'false\' WHERE serverid = " + message.guild.id);
                message.channel.send("Self-Assignable Roles were disabled!");
            } else{
                message.channel.send("Value not valid, please use \"true\" or \"false\"");
            }
            break;
        default:
            message.channel.send("That is not an option you can set.");
    }
}