const Discord = require(`discord.js`);
const prettyMs = require(`pretty-ms`);

module.exports = {
    name: "info",
    aliases: [],    
    helpDesc: "information about the robot",
    helpTitle: "Info",
    run: async (bot, message, args) => {
        let voiceConnections = 0;

        for(server in bot.servers){
            if(server.player) voiceConnections++;
        }

        var infoEmbed = new Discord.MessageEmbed()
            .setColor('#E81F2F')
            .setAuthor('Dragonite Info' , bot.client.user.displayAvatarURL())
            .setDescription("General information about Dragonite")
            .addField("Uptime", prettyMs(process.uptime() * 1000, {secDecimalDigits: 0}))
            .addField("Version", bot.version)
            .addField("Owner", "1Revenger1#2952 (ID: 139548522377641984)")
            .addField("Voice Connections", voiceConnections)
            .addField("Why was Dragonite created?", "One day I was bored, and a few friends of mine were making their own Discord bots. I realized that it had been a very long time since I had learnt Javascript, and decided it would be a fun, if small, project. So much for it being small...I guess")
            .addField("What did you use to create Dragonite?", "Most of the code was written in Microsoft Visual Studio Code, running through node.js. It's integration with Discord is done through Discord.js, using the master branch.");

            message.channel.send({embed: infoEmbed});
    }
}