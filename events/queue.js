exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    if(require(dragonite).servers[message.guild.id].queue){
        pages = Math.floor(require(dragonite).servers[message.guild.id].queue.length / 10) + 1;
        if(args[1]){
            page = args[1];
            var queueS = '';
            for(var songn = 0; songn + 10 * (page - 1) < (require(dragonite).servers[message.guild.id].queue.length) && songn < 10; songn++){
                queueS += '`[' + (songn + 10 * (page - 1) + ']` ' + require(dragonite).servers[message.guild.id].queue[songn + 10 * (page - 1)].title + ' by ' + require(dragonite).servers[message.guild.id].queue[songn + 10 * (page - 1)].author + '\n');
            }
            message.channel.send('Page **' + page + '** of **' + pages + '**\n\n' + queueS);
        } else {
            page = 0;
            var queueS = '';
            for(var songn = 0; songn + 10 * (page) < (require(dragonite).servers[message.guild.id].queue.length) && songn < 10; songn++){
                queueS += '`[' + (songn + 10 * (page) + ']` ' + require(dragonite).servers[message.guild.id].queue[songn + 10 * (page)].title + ' by ' + require(dragonite).servers[message.guild.id].queue[songn + 10 * (page)].author + '\n');
            }
            message.channel.send('Page **' + (page + 1) + '** of **' + pages + '**\n\n' + queueS + '\n Use the Queue command with a page number to see other pages!');
        }					

    } else {
        message.channel.send('Queue has not been created yet');
    }
}