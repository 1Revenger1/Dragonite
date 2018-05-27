module.exports = {
    name: "removerole",
    aliases: [],    
    helpDesc: "Removes the specified role from Dragonite's list of roles to give out",
    helpTitle: "RemoveRole <name of role>",
    cat: "admin",
    permLevel: require(`../Dragonite.js`).levels.level_2,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
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
                bot.db.run("UPDATE servers SET roleIDs =\'" + dbInsert + "\' WHERE serverid = " + message.guild.id);
                return;
            }
        }
        message.channel.send("Unsuccesful in removing Role from list, please make sure the role name is spelt and capitalized correctly.");
    }
}