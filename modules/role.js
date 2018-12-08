const Discord = require('discord.js');

module.exports = {
    name: "role",
    aliases: ["roles"],    
    helpDesc: "Gives the user a role if the name of it is provided. Otherwise lists all the roles Dragonite can give.",
    helpTitle: "Role <Optional: role name>",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!(server.selfAssignOn == 'true')){
            message.channel.send("Self Assignable Roles are not enabled on this server! Please ask an administrator to turn it on using " + server.prefix + "options");
            return;
        }
        
        if(!server.roles){
            server.roles = [];
        }
        
        if(!args[1]){
            var msg = new Discord.MessageEmbed()
                        .setAuthor(message.guild.name + " roles" , message.guild.iconURL());
            var msgDesc = "Here are the current roles that are assignable:";
            
            if(!server.roles[0]) {
                console.log('No roles assigned for server');
                message.channel.send("No roles are assigned yet to be given out! Use " + server.prefix + "addRole <Name of role>");
                return;
            }
            
            for(var i = 0; i < server.roles.length; i++){
                msgDesc += "\n" + server.roles[i].toString();
            }
            
            
            msgDesc += "\n\nYou can assign these roles by using " + server.prefix + "role <names of roles>\nEX: `" + server.prefix + "role ";
            msgDesc += server.roles[0].name;
            if(server.roles[1]) msgDesc += ", " + server.roles[1].name + "`";
            msg.setDescription(msgDesc);
            message.channel.send({embed: msg});
        } else {
            if(!bot.client.guilds.get(message.guild.id).me.hasPermission("MANAGE_ROLES")){
                message.channel.send("I don't have the perms to manage roles!");
                return;
            }
    
            let roleArg = "";
            for(var i = 1; i < args.length; i++){
                roleArg += args[i] + " ";
            }
            roleArg = roleArg.trim();
            
            let rolesToGiveArgs = roleArg.split(',');
            
            let msg = new Discord.MessageEmbed()
                .setAuthor(message.guild.name + " roles" , message.guild.iconURL());
            let msgAdded = "";
            let msgRemoved = "";
            
            let countError = 0;
            
            for(roleI in rolesToGiveArgs){
                rolesToGiveArgs[roleI] = rolesToGiveArgs[roleI].trim();
                for(serverRole in server.roles){
                    if(rolesToGiveArgs[roleI] == server.roles[serverRole].name){
                        let role = server.roles[serverRole];
                        try{
                            if(message.member.roles.has(role.id)){
                                await message.member.roles.remove(role);
                                msgRemoved += role.toString() + " ";
                            } else {
                                await message.member.roles.add(role);
                                msgAdded += role.toString() + " ";
                            }
                        } catch(err) {
                            countError++;
                            console.log(err);
                        }
                    }
                }
            }
            
            if(msgAdded != "")
                msg.addField("Roles added", msgAdded);
            
            if(msgRemoved != "")
                msg.addField("Roles removed", msgRemoved);
            
            if(countError > 0){
                msg.addField(countError + " errors occured!", "Make sure the roles exist!");
            }
            
            message.channel.send({embed : msg});
        }
        
    }
}