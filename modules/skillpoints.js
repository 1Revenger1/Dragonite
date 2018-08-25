const Discord = require('discord.js');

var statEnum = {
    HP: "HP",
    Speed: "SPEED",
    Damage: "DAMAGE",
    EXP: "EXP"
}

module.exports = {
    name: "skillpoints",
    aliases: ["sp"],    
    helpDesc: "Rank up/View stats for fighting",
    helpTitle: "SkillPoints",
    run: async (bot, message, args) => {
        let server = bot.servers[message.guild.id];
        var embed = new Discord.MessageEmbed();
        let levelUtil = require(`../utils/fightLvl.js`);
        var skillPts;
        var num;
        var statChanged;
        var newTotal;

        var person = message.mentions.members.first() ? message.mentions.members.first() : message.member;

        bot.fightDB.get("SELECT * from ServerID" + message.guild.id + " WHERE userID=" + person.id, async function(err, row){
            if(err){
                console.log(err);
                return;
            }

            if(row == undefined){
                sqlDataPer1 = await levelUtil.newMember(person, bot);
            } else {
                sqlDataPer1 = row;
            }

            sqlDataPer1.level = await levelUtil.calcLevel(sqlDataPer1.EXP)
            
            expForm = {
                currentEXP: 0,
                neededEXP: 0
            }

            levelUtil.neededEXP(sqlDataPer1.EXP, expForm);

            //Skillpoints left to spend
            skillPts = parseInt(sqlDataPer1.level) - (parseInt(sqlDataPer1.HP) + parseInt(sqlDataPer1.SPEED) + parseInt(sqlDataPer1.DAMAGE) + parseInt(sqlDataPer1.EXPM)) - 1;

            if(!args[1] || person != message.member){
                embed.setAuthor(person.displayName + "'s stats in " + message.guild.name , person.user.displayAvatarURL());
                embed.setDescription("Level: " + sqlDataPer1.level + "\nEXP: (" + expForm.currentEXP + " / " + expForm.neededEXP + ")");
                embed.addField("Stat Levels", `HP: ${(sqlDataPer1.HP)}\nSpeed: ${(sqlDataPer1.SPEED)}\nDamage: ${(sqlDataPer1.DAMAGE)}\nEXP Multiplier: ${(sqlDataPer1.EXPM)}`);
                embed.addField("Skill points to spend", skillPts + "\nSpend by doing " + server.prefix + "skillpoints <name> <num of points to spend>");
            } else {
                embed.setAuthor(person.displayName + " Skill Point Confirmation", person.user.displayAvatarURL());;
                statChanged;
                num = 1;

                //Check if user wants to spend more than one 
                if(args[2]){
                    try{
                        num = parseInt(args[2]);
                        if(num < 1) throw "Less than 1";
                    } catch (err) {
                        return message.channel.send("Not a valid number! Err: `" + err + "`");
                    }
                }

                switch(args[1].toUpperCase()){
                    case statEnum.HP:
                        statChanged = statEnum.HP;
                        newTotal = sqlDataPer1.HP + num;
                        break;
                    case statEnum.EXP:
                        statChanged = statEnum.EXP;
                        newTotal = sqlDataPer1.EXPM + num;
                        break;
                    case statEnum.Damage:
                        statChanged = statEnum.Damage;
                        newTotal = sqlDataPer1.DAMAGE + num;
                        break;
                    case statEnum.Speed:
                        statChanged = statEnum.Speed;
                        newTotal = sqlDataPer1.SPEED + num;
                        break;
                    default:
                        return message.channel.send("Not a valid stat!");
                }

                //Check that you have enough skill pts
                if(num > skillPts){
                    return message.channel.send("You don't have that many skill points to spend! You have `" + skillPts + "` points to spend.");
                }

                embed.setDescription("Do you really want to spend " + num + " upgrading " + statChanged + "?\nRespond with `Yes` or `No`");

                message.collector = message.channel.createMessageCollector(m => m.member.id == message.member.id, { time: 60000 });
                message.collector.on('collect', m => handleAnswer(m));
                message.collector.on('end', reason => handleEnd(reason));
            }

            message.channel.send({embed: embed});

        });

        function handleEnd(reason){
            if(reason != 'Answer'){
                message.channel.send("No answer given before time-out. Please re-run the command.");
            }
        }

        async function handleAnswer(m){
            var answerEmbed = new Discord.MessageEmbed();
            answerEmbed.setAuthor(person.displayName + " Skill Point Confirmation" , person.user.displayAvatarURL());

            if(m.content.toLowerCase() == "yes"){
                answerEmbed.setDescription("Putting `" + num + "` points into `" + statChanged + "`");
                
                //Different name in SQL
                if(statChanged == statEnum.EXP) statChanged = "EXPM";

                bot.fightDB.run("UPDATE ServerID" + message.guild.id + " SET " + statChanged + " = " + newTotal + " WHERE userID=" + person.id, err => {
                    if(err) message.channel.send("Error occured putting data into Database!\nError Message: `" + err + "`");
                });
            } else if (m.content.toLowerCase() == "no"){
                answerEmbed.setDescription("Cancelling...");
            } else {
                return;
            }

            message.channel.send({embed: answerEmbed})
            message.collector.stop('Answer');
        }
    }
} 