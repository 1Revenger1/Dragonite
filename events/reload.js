exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    servers = require(dragonite).servers;

    if(!(message.author.id === '139548522377641984')) {
        message.reply('You are not the owner of Dragonite and Dragonite the Bold');
        return;
    }

    if(!args || args.size < 1) return message.reply("Must provide a command name to reload.");

    // if(args[1] = 'all'){
    //     try{
    //     } catch(err){

    //     }
    // }
    // the path is relative to the *current folder*, so just ./filename.js
    try{
        delete require.cache[require.resolve(`./${args[1]}.js`)];
        message.reply(`The command ${args[1]} has been reloaded`);
    } catch(err){
        message.channel.send('Please use a real command name');
    }


}