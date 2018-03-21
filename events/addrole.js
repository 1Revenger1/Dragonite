const Discord = require('discord.js');
module.exports = {
    name: "addrole",
    aliases: [],
    helpDesc: "Add roles to Dragonite's list of roles that it is able to give people",
    helpTitle: "addRole <name of role>",
    cat: "admin",
    permLevel: require(`../Dragonite.js`).levels.level_1,
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        const server = bot.servers[message.guild.id];
        
        if(server.selfAssignOn == 'true'){
            message.channel.send("Self Assignable Roles are not enabled on this server! Please turn it on using " + server.prefix + "options");
            return;
        }
        
        var roleArg = "";
        for(var i = 1; i < args.length; i++){
              roleArg += args[i] + " ";
        }

        roleArg = roleArg.trim();
        if(!(await bot.checkRoleExists("name", roleArg, message.guild))){
            message.channel.send("Role does not exist");
            return;
        }

        for(var i = 0; i < server.roles.length; i++){
            if(roleArg == server.roles[i].name){
                message.channel.send("Role already in list!");
                return;
            }
        }
    
        server.roles[server.roles.length] = await bot.getRole("name", roleArg, message.guild);
        message.channel.send(roleArg + " added to the available roles users can add.");
        var dbInsert = "";
        for(var i = 0; i < server.roles.length; i++){
            dbInsert += server.roles[i].id + " ";
        }

        bot.db.run("UPDATE servers SET roleIDs =\'" + dbInsert + "\' WHERE serverid = " + message.guild.id);
    }
}