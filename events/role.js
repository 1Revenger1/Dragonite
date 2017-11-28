exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
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
        for(var i = 0; i < server.roles.length; i++){
            msg += "\n" + server.roles[i].name;
        }
        msg += "\nYou can assign these roles by using " + server.prefix + "role <name of role>";
        message.channel.send(msg);
    } else {
        if(!client.guilds.get(message.guild.id).me.hasPermission("MANAGE_ROLES")){
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
                message.member.addRole(roleToGive , "The user requested the role");
                message.channel.send("Giving " + roleToGive.name + " to " + message.member.displayName);
            } catch(err) {
                message.channel.send("That didn't quite work...please try again!");
            }
        } else {
            message.channel.send("Role does not exist");
        }
    }
}