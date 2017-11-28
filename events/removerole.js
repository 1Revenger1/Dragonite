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
    var roleArg = "";
    for(var i = 1; i < args.length; i++){
        roleArg += args[i] + " ";
    }
    roleArg = roleArg.trim();
    if(!args[1]){
        message.channel.send("Please give name of the role you want to remove from the list of self-assignable roles.");
        return;
    }

    for(var i = 0; i < server.roles.length; i++){
        if(roleArg == server.roles[i].name){
            server.roles.splice(i, 1);
            message.channel.send("Succesfully removed " + roleArg + " from list of self-assignable roles.");
            var dbInsert = "";
            for(var i = 0; i < server.roles.length; i++){
                dbInsert += server.roles[i].id + " ";
            }
            db.run("UPDATE servers SET roleIDs =\'" + dbInsert + "\' WHERE serverid = " + message.guild.id);
            return;
        }
    }
    message.channel.send("Unsuccesful in removing Role from list, please make sure the role name is spelt and capitalized correctly.");
}