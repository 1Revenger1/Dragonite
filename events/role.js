module.exports = {
    name: "role",
    aliases: [],    
    helpDesc: "Gives the user a role if the name of it is provided. Otherwise lists all the roles Dragonite can give.",
    helpTitle: "Role <Optional: role name>",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(!(server.selfAssignOn == 'true')){
            message.channel.send("Self Assignable Roles are not enabled on this server! Please ask an administrator to turn it on using " + server.prefix + "options");
            return;
        }
        if(!args[1]){
            var msg = "Here are the current roles that are assignable:";
            if(!server.roles[0]) {
                console.log('No roles assigned for server');
                message.channel.send("No roles are assigned yet to be given out! Use " + server.prefix + "addRole <Name of role>");
                return;
            }
            
            msg += "```diff";
            for(var i = 0; i < server.roles.length; i++){
                msg += "\n- " + server.roles[i].name;
            }
            
            msg += "```\n";
            
            msg += "\nYou can assign these roles by using " + server.prefix + "role <name of role>";
            message.channel.send(msg);
        } else {
            if(!bot.client.guilds.get(message.guild.id).me.hasPermission("MANAGE_ROLES")){
                message.channel.send("I don't have the perms to manage roles!");
                return;
            }
    
            var roleArg = "";
            for(var i = 1; i < args.length; i++){
                roleArg += args[i] + " ";
            }
            roleArg = roleArg.trim();
    
            var isRole = false;
            var roleToGive;
            for(var i = 0; i < server.roles.length; i++){
                if(roleArg == server.roles[i].name){
                    isRole = true;
                    roleToGive = server.roles[i];
                }
            }
            if(isRole == true){
                try{
                    if(message.member.roles.has(roleToGive.id)){
                        message.channel.send(message.member.displayName + " already has `" + roleToGive.name + "`");
                        return;
                    }
                    message.member.roles.add(roleToGive , "The user requested the role");
                    message.channel.send("Giving " + roleToGive.name + " to " + message.member.displayName);
                } catch(err) {
                    console.log(err);
                    message.channel.send("That didn't quite work...please try again!");
                }
            } else {
                message.channel.send("Role does not exist");
            }
        }
    }
}