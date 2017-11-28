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
    if(message.member.hasPermission('ADMINISTRATOR')){
        var roleArg = "";
        for(var i = 1; i < args.length; i++){
            roleArg += args[i] + " ";
        }
        roleArg = roleArg.trim();
        if(!message.guild.roles.exists('name', roleArg)){
            message.channel.send("Role does not exist");
            return;
        }

        for(var i = 0; i < server.roles.length; i++){
            if(roleArg == server.roles[i].name){
                message.channel.send("Role already in list!");
                return;
            }
        }

        server.roles[server.roles.length] = message.guild.roles.find('name', roleArg);
        message.channel.send(roleArg + " added to the available roles users can add.");
        var dbInsert = "";
        for(var i = 0; i < server.roles.length; i++){
            dbInsert += server.roles[i].id + " ";
        }
        db.run("UPDATE servers SET roleIDs =\'" + dbInsert + "\' WHERE serverid = " + message.guild.id);
    } else {
        message.channel.send("You do not have the perms to use this command.");
    }
}