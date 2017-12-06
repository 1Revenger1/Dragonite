const Discord = require('discord.js');

exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    var server = require(dragonite).servers[message.guild.id];

    function callOptionsEmbed(rolesOn, musicChannel){
        var optionsEmbed = new Discord.MessageEmbed()
            .setColor('#E81F2F')
            .setAuthor('Options for ' + message.guild.name, message.guild.iconURL)
            .addField('Self-Assignable Roles (\'role\')', 'Enabled: ' + rolesOn + '\nHas permission \'MANAGE_ROLES\': ' + client.guilds.get(message.guild.id).me.hasPermission("MANAGE_ROLES"))
			.addField('Forced Music Channel (\'musicChannel\')', 'Status: ' + musicChannel + '\n\nYou set this by doing options musicChannel <name of channel> or turn it off by doing option musicChannel off');

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
		var musicChannel = server.defaultMusic;
		if(musicChannel instanceof Object){
			musicChannel = 'Set to ' + musicChannel.name;
		}
		
        callOptionsEmbed(rolesOn, musicChannel);
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
		case "musicChannel":
			if(args[2] == 'off'){
				server.defaultMusic = 'No music channel selected';
				db.run("UPDATE servers SET defaultMusicID=null WHERE serverid = " + message.guild.id);
			} else {
				if(message.guild.channels.exists('name', args[2])){
					server.defaultMusic = message.guild.channels.find('name', args[2]);
					db.run("UPDATE servers SET defaultMusicID=\'" + message.guild.channels.find('name', args[2]).id + "\' WHERE serverid = " + message.guild.id);
					return;
				} else {
					message.channel.send('That is not a valid voice channel');
				}
			}
			break;
        default:
            message.channel.send("That is not an option you can set.");
    }
}