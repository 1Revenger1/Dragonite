const Discord = require('discord.js');

module.exports = {
    name: "options",
    aliases: [],    
    helpDesc: "Options for how Dragonite behaves in each guild",
    helpTitle: "Options",
    cat: "admin",
    permLevel: require(`../Dragonite.js`).levels.level_2,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!args[1]){
            var rolesOn = server.selfAssignOn;
            var musicChannel = server.defaultMusic;
    
            var optionString = "***__Dragonite Options__***\n\n";		
            var roleString = "**__Role__**\n";
            var musicString = "**__Music__**\n";
            var loggingString = "**__Logging__**\n";
            var endString = "You can change options in italics. For more details, do `" + server.prefix + "options <name of header>`";

            roleString += "Enabled: " + trueCheck(rolesOn) +
                          "Has \"Manage Role\": " + (message.guild.me.hasPermission("MANAGE_ROLES") == true ? ":white_check_mark:" : ":x:") + "\n";
    
            musicString += "Music Channel set: " + (musicChannel != undefined ? ":white_check_mark:" : ":x:") + "\n" + 
                           "Music Channel: " + (musicChannel != undefined ? musicChannel.name : "Not set") + "\n";

            loggingString += "Logging Dump Channel: " + (server.logChannel != undefined ? server.logChannel.name : "Not set") + "\n" + 
                            "Join Logs Dump Channel: " + (server.userLogChannel != undefined ? server.userLogChannel.name : "Not set") + "\n" + 
                            "Enabled: " + trueCheck(server.loggingEnabled) +
                            "Channel Logs: " + trueCheck(server.loggingChannel) + 
                            "Emoji Logs: " + trueCheck(server.loggingEmoji) + 
                            "Join Logs: " + trueCheck(server.loggingJoin) + 
                            "User Logs: " + trueCheck(server.loggingUser) + 
                            "Message Logs: " + trueCheck(server.loggingMessage) + 
                            "Role Logs: " + trueCheck(server.loggingRole) + "\n";
    
            optionString += roleString + "\n" + musicString + "\n" + loggingString + "\n" + endString;
    

    
            message.channel.send(optionString);
                
    
            // message.channel.send("Use \"" + server.prefix + "options (name in paranthesis) (true or false)\" to turn that option on or off\n" +
            // 						"Example: `??options role true`");
            return;
        }
        
        switch(args[1].toLowerCase()){
            case "role":
                if(args[2] == "true" || args[2] == "false"){
                    server.selfAssignOn = args[2];
                    bot.db.run("UPDATE servers SET selfAssignOn=\'" + args[2] + "\' WHERE serverid = " + message.guild.id);
                    message.channel.send("Roles enabled set to " + args[2]);
                } else{
                    message.channel.send("Allows you to enable/disable Dragonite's role system. Use `" + server.prefix + "options role true/false` to set");
                }
                break;
            case "music":
                if(args[2] == 'off'){
                    server.defaultMusic = null;
                    bot.db.run("UPDATE servers SET defaultMusicID=null WHERE serverid = " + message.guild.id);
                } else if (args[2]){
                    if(message.guild.channels.exists('name', args[2])){
                        server.defaultMusic = message.guild.channels.find('name', args[2]);
                        bot.db.run("UPDATE servers SET defaultMusicID=\'" + server.defaultMusic.id + "\' WHERE serverid = " + message.guild.id);
                        message.channel.send("Music channel set to " + args[2]);
                        return;
                    } else {
                        message.channel.send('That is not a valid voice channel');
                    }
                } else {
                    message.channel.send("Allows you to force Dragonite to play in only one voice channel. Use `" + server.prefix + "options music (Voice Channel Name/off)` to set");
                }
                break;
            case "logging":
                if(args[2]){
                    args[3] = args[3] ? args[3].toLowerCase(): null;
                    var optionChanged = false;
                    switch(args[2].toLowerCase()){
                        case "true":
                        case "false":
                            optionChanged = true;
                            server.loggingEnabled = args[2];
                            message.channel.send("Logging Enabled set to `" + args[2].toLowerCase() + "`");
                            break;
                        case "channel":
                            optionChanged = setTrueCheck(args[3], server, "Channel Logging", message);
                            break;
                        case "emoji":
                            optionChanged = setTrueCheck(args[3], server, "Emoji Logging", message);
                            break;
                        case "join":
                            optionChanged = setTrueCheck(args[3], server, "Join Logging", message);
                            break;
                        case "user":
                            optionChanged = setTrueCheck(args[3], server, "User Logging", message);
                            break;
                        case "message":
                            optionChanged = setTrueCheck(args[3], server, "Message Logging", message);
                            break;
                        case "role":
                            optionChanged = setTrueCheck(args[3], server, "Role Logging", message);
                            break;
                        case "setloggingchannel":
                            if(message.guild.channels.exists('name', args[3])){
                                server.logChannel = message.guild.channels.find('name', args[3]);
                                bot.db.run("UPDATE servers SET loggingChannelID=\'" + server.logChannel.id + "\' WHERE serverid = " + message.guild.id);
                                message.channel.send("Logging channel set to " + args[3]);
                                return;
                            } else {
                                message.channel.send('That is not a valid text channel');
                            }
                            break;
                        case "setjoinloggingchannel":
                            if(message.guild.channels.exists('name', args[3])){
                                server.userLogChannel = message.guild.channels.find('name', args[3]);
                                bot.db.run("UPDATE servers SET userJoinLogChannelID=\'" + server.userLogChannel.id + "\' WHERE serverid = " + message.guild.id);
                                message.channel.send("Join Logging channel set to " + args[3]);
                                return;
                            } else {
                                message.channel.send('That is not a valid text channel');
                            }
                            break;
                        default:
                            message.channel.send("Incorrect parameter - Use " + server.prefix + "options logging for more details");
                            break;
                    }

                    if(optionChanged){
                        bot.db.run("UPDATE servers SET loggingEnabled='" + server.loggingEnabled 
                                                                     + " " + server.loggingChannel
                                                                     + " " + server.loggingEmoji
                                                                     + " " + server.loggingJoin
                                                                     + " " + server.loggingUser 
                                                                     + " " + server.loggingMessage 
                                                                     + " " + server.loggingRole 
                                                                     + "' WHERE serverid = " + message.guild.id);
                    }

                } else {
                    message.channel.send("Logging Control Panel. Use `" + server.prefix + "options logging \"true\"/\"false\"` to enable logging.\n\n" + 
                                        "**Other Options:**\n`" + server.prefix + "options logging setLoggingChannel/setJoinLoggingChannel <Name of text channel>`\nSets the logging channel. Join Logging is for when users join/leave\n\n" +
                                        "`" + server.prefix + "options logging \"channel\"/\"Join\"/etc... \"true\"/\"false\"`\nEnables or Disables different modules of the logger.");
                }
                break;
            default:
                message.channel.send("That is not an option you can set.");
        }
    }
}

function setTrueCheck(string, server, name, message){
    if(string == "true" || string == "false"){
        if(name.includes("Channel")){
            server.loggingChannel = string;
        } else if(name.includes("Emoji")){
            server.loggingEmoji = string;
        } else if(name.includes("Join")){
            server.loggingJoin = string;
        } else if(name.includes("User")){
            server.loggingUser = string;
        } else if(name.includes("Message")){
            server.loggingMessage = string;
        } else if(name.includes("Role")){
            server.loggingRole = string;
        }

        message.channel.send(name + " set to `" + string + "`");
        return true;
    } else {
        message.channel.send("Incorrect parameter. Use \"True\" or \"False\"");
        return false;
    }
}

function trueCheck(check){
    return check == "true" ? ":white_check_mark: \n" : ":x: \n";
}