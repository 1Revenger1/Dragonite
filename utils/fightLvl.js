//5 * (lvl ^ 2) + 50 * lvl + 100
exports.calcLevel = async function(totalEXP){
    var tempEXP = totalEXP;
    var level = 0;

    do { 
        tempEXP -= (5 * Math.pow(level, 2)) + (50 * level) + 100;
        level++;
    } while (tempEXP >= 0)

    return level;
    //Mee6 equation placeholder
}

exports.randEXP = function(){
    return Math.floor(Math.random() * 10 + 15);
}

exports.neededEXP = async function(totalEXP, expForm){
    var tempEXP = totalEXP;
    var level = 0;
    
    while (tempEXP >= (5 * Math.pow((level), 2)) + (50 * (level)) + 100) {
        tempEXP -= (5 * Math.pow(level, 2)) + (50 * level) + 100;
        level++
    }

    expForm.currentEXP = tempEXP;
    expForm.neededEXP = (5 * Math.pow(level, 2)) + (50 * level) + 100;
    return;
}

exports.calcMult = function(lvl, value){
    //2.5% increase per level
    var mult = lvl * 0.025;
    return Math.floor(value + (value * mult));
}

//Ran whenever a member is not in the database
exports.newMember = function(member, bot){
    bot.fightDB.run(`INSERT INTO ServerID` + member.guild.id + ` VALUES(${member.id}, 0, 0, 0, 0, 0, 0)`);
    return { EXP: 0,
        level: 0,
        hp: 0,
        speed: 0,
        damage: 0,
        expm: 0,
        powerup: 1 };
}
