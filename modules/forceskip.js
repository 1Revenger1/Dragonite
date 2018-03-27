const Discord = require('discord.js');

module.exports = {
    name: "forceskip",
    aliases: [],    
    helpDesc: "Skips the current song without going through the vote",
    helpTitle: "ForceSkip",
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
            var endString = "You can change options in italics. For more details, do `" + server.prefix + "options <name of header>`";

            roleString += "*Enabled:* " + (rolesOn == "true" ? ":white_check_mark:" : ":x:") + "\n" +
                          "Has \"Manage Role\": " + (message.guild.me.hasPermission("MANAGE_ROLES") == true ? ":white_check_mark:" : ":x:") + "\n";
    
            musicString += "Music Channel set: " + (musicChannel != null ? ":white_check_mark:" : ":x:") + "\n" + 
                           "*Music Channel:* " + (musicChannel != null ? musicChannel.name : "Not set") + "\n";
    
            optionString += roleString + "\n" + musicString + "\n" + endString;
    

    
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
                message.channel.send("Not implemented yet");
                break;
            default:
                message.channel.send("That is not an option you can set.");
        }
    }
}