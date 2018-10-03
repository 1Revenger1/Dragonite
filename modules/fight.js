module.exports = {
    name: "fight",
    aliases: [],    
    helpDesc: "Fight a person",
    helpTitle: "Fight <@person>",
    run: async (bot, message, args) => {
        let server = bot.servers[message.guild.id];

        let levelUtil = require(`../utils/fightLvl.js`);

        if(server.isFighting){
            message.reply("Please wait a moment for the current fight to finish.");
            return;
        }

        if(message.mentions.everyone){
            message.channel.send("How are you supposed to fight everyone here? That seems *really* difficult...");
            server.isFighting = false;
            return;
        }        
        
        let person = message.member;
        person = message.mentionEvent && (message.mentions.members.size > 1) ? message.mentions.members.array()[1] : person;
        person = (!message.mentionEvent) && message.mentions.members.first() ? message.mentions.members.first() : person;
        
        if((!message.mentionEvent && message.mentions.users.size < 1) || (message.mentionEvent && message.mentions.users.size < 2)){
            message.channel.send("Please mention a user");
            server.isFighting = false;
            return;
        }
                
        server.isFighting = true;

        var sqlDataPer1 = null;
        var sqlDataPer2 = null;

        bot.fightDB.get("CREATE TABLE IF NOT EXISTS ServerID" + message.guild.id + "(userID TEXT, EXP TEXT, HP TEXT, SPEED TEXT, DAMAGE TEXT, EXPM TEXT, POWERUP TEXT)", async function(err, row){
            if(err){
                console.log(err);
                return;
            }
            
            bot.fightDB.get("SELECT * from ServerID" + message.guild.id + " WHERE userID=" + message.member.id, async function(err, row){
                if(err){
                    console.log(err);
                    return;
                }

                if(row == undefined){
                    sqlDataPer1 = levelUtil.newMember(message.member, bot);
                } else {
                    sqlDataPer1 = row;
                }
                
                


                bot.fightDB.get("SELECT * from ServerID" + message.guild.id + " WHERE userID=" + person.id, function(err, row){
                    if(err){
                        console.log(err);
                        return;
                    }
    
                    if(row == undefined){
                        sqlDataPer2 = levelUtil.newMember(person, bot);
                    } else {
                        sqlDataPer2 = row;
                    }
                    fight();
                });
            });
        });

        async function fight() {
            var responses = [
                ' was hit on the head by ',
                ' was kicked by ',
                ' was slammed into a wall by ',
                ' was dropkicked by ',
                ' was DDoSed by ',
                ' was chokeslammed by ',
                ' was run over with a robot by ',
                ' had their IQ dropped 15 points by ',
                ' had a heavy object dropped on them by ',
                ' was beat up by ',
                //Above responses by Micheal from 4150
                ' was swept off their feet by ',
                ' was hit by a hammer by ',
                ' had their dexterity dropped 2 by '
            ]

            var damage = [ 25, 50, 75, 100, 125, 150, 200, 250]
            var messagesToDelete = [];
            
            if(person.id == message.member.id){
                message.channel.send("Hold up - I'm stopping it right here. No fighing yourself");
                server.isFighting = false;
                return;
            }


            var personOne = {
                member: message.member,
                level: await levelUtil.calcLevel(sqlDataPer1.EXP),
                exp: parseFloat(sqlDataPer1.EXP),
                hp: Math.floor(levelUtil.calcMult(parseFloat(sqlDataPer1.HP), 500)),
                speed: levelUtil.calcMult(parseFloat(sqlDataPer1.SPEED), 1),
                damage: levelUtil.calcMult(parseFloat(sqlDataPer1.DAMAGE), 1),
                expm: levelUtil.calcMult(parseFloat(sqlDataPer1.EXPM), 1),
                powerup: 1
            };

            var personTwo = {
                member: person,
                level: await levelUtil.calcLevel(sqlDataPer2.EXP),
                exp: parseFloat(sqlDataPer2.EXP),
                hp: Math.floor(levelUtil.calcMult(parseFloat(sqlDataPer2.HP), 500)),
                speed: levelUtil.calcMult(parseFloat(sqlDataPer2.SPEED), 1),
                damage: levelUtil.calcMult(parseFloat(sqlDataPer2.DAMAGE), 1),
                expm: levelUtil.calcMult(parseFloat(sqlDataPer2.EXPM), 1),
                powerup: 1
            }

            if(isNaN(personOne.exp)){
                personOne.exp = 0;
            }
            
            if(isNaN(personTwo.exp)){
                personTwo.exp = 0;
            }
            
            message.channel.send(`__**${personOne.member.displayName}** [lvl: ${personOne.level} ] vs **${personTwo.member.displayName}** [lvl: ${personTwo.level} ]__`);

 /*           if(personTwo.member.id == '139548522377641984'){
                message.channel.send(`${personTwo.member.displayName} shuts off Dragonite. ${personOne.member.displayName} waits... [-1000 damage] [0 hp left]`);
                message.channel.send("There is no EXP to be found here...");
                server.isFighting = false;
                return;
            }*/

            if(personTwo.member.user.bot){
                message.channel.send(`${personOne.member.toString()} stares into the black abyss that are ${personTwo.member.toString()}'s eyes and freezes! [-1000 damage] [0 hp left]`);
                message.channel.send("There is no EXP to be found here...");
                server.isFighting = false;
                return;
            }

            var playerOneTurn = Math.random() >= 0.5;

            while(personOne.hp > 0 && personTwo.hp > 0){
                var damageType = Math.floor(Math.random() * responses.length);
                var damageValue = damage[Math.floor(Math.random() * damage.length)];

                if(playerOneTurn){
                    damageValue = Math.floor(damageValue * personOne.damage);
                    playerOneTurn = false;
                    personTwo.hp -= ((personTwo.hp - damageValue) < 0 ? personTwo.hp : damageValue);
                    messagesToDelete[messagesToDelete.length] = await message.channel.send("**" + personTwo.member.displayName + "**" + responses[damageType] + "**" + personOne.member.displayName + "**! [-" + damageValue + "] [" + personTwo.hp + " hp left]");
                } else {
                    damageValue = Math.floor(damageValue * personTwo.damage);
                    playerOneTurn = true;
                    personOne.hp -= ((personOne.hp - damageValue) < 0 ? personOne.hp : damageValue);
                    messagesToDelete[messagesToDelete.length] = await message.channel.send("**" + personOne.member.displayName + "**" + responses[damageType] + "**" + personTwo.member.displayName + "**! [-" + damageValue + "] [" + personOne.hp + " hp left]");

                }

                await bot.sleep(1200);
            }

            if(personOne.hp <= 0){
                var expGain = levelUtil.randEXP();
                message.channel.send(personOne.member.toString() + " lost but gained " + Math.floor(expGain / 2) + " EXP. Sorry :(\n " + personTwo.member.toString() + " won and gained " + Math.floor(expGain * 2) + " EXP! Come Again!");
                personOne.exp += Math.floor(expGain / 2);
                personTwo.exp += Math.floor(expGain * 2);
            } else {
                var expGain = levelUtil.randEXP();
                message.channel.send(personOne.member.toString() + " won and gained " + Math.floor(expGain * 2) + " EXP!\n " + personTwo.member.toString() + " lost but gained " + Math.floor(expGain / 2) + " EXP. Sorry :( Come Again!");
                personTwo.exp += Math.floor(expGain / 2);
                personOne.exp += Math.floor(expGain * 2);
            }

            if(personOne.level != await levelUtil.calcLevel(personOne.exp)){
                message.channel.send(`${personOne.member.toString()} leveled up! New level: ${await levelUtil.calcLevel(personOne.exp)}`);
            }

            if(personTwo.level != await levelUtil.calcLevel(personTwo.exp)){
                message.channel.send(`${personTwo.member.toString()} leveled up! New level: ${await levelUtil.calcLevel(personTwo.exp)}`);
            }

            bot.fightDB.run(`UPDATE ServerID${message.guild.id} SET EXP = '${personOne.exp}' WHERE userID = '${personOne.member.id}'`);
            bot.fightDB.run(`UPDATE ServerID${message.guild.id} SET EXP = '${personTwo.exp}' WHERE userID = '${personTwo.member.id}'`);

            server.isFighting = false;
            setTimeout(async function(){
                for(var i = 0; i < messagesToDelete.length; i++){
                    await messagesToDelete[i].delete();
                }
            }, 5000);
        }
    }
}


