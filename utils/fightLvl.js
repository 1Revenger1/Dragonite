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