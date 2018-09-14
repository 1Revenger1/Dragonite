
const prettyMs = require('pretty-ms');

module.exports = {
    name: "queue",
    aliases: ["playlist"],    
    helpDesc: "Shows the current list of songs",
    helpTitle: "Queue, Playlist <page #>",
    cat: "music",
    run: async (bot, message, args) => {
        var dragonite = `../Dragonite.js`;
    
        var server = bot.servers[message.guild.id];		

        if(!server.queue){
            message.channel.send("I\'m not playing anything yet");
            return;
        }

        var page = 0;
        var pages = Math.floor((server.queue.length - 1) / 10) + 1;
        var totalTimeLeft = bot.remainingTime(message);

        if(args[1]){
            page = Number.parseInt(args[1]) - 1;
        }

        if(page >= pages){
            page = pages - 1;
        }

        var queueS = "__Page **" + (page + 1) + "** of **" + pages + "**__\n";

        var timeLeft = totalTimeLeft == -1 ? "Unknown - Stream in queue" : prettyMs(totalTimeLeft, {secDecimalDigits: 0});
        
        var timeForCurrentSong = server.queue[0].stream ? "Live" : prettyMs(Date.now() - server.player.timestamp, {secDecimalDigits: 0});
        
        queueS += "Now playing " + server.queue[0].title + " by " + server.queue[0].author + " `" + timeForCurrentSong + "`\n";
        queueS += "Time left: `" + timeLeft + "` Songs left: `" + (server.queue.length - 1) + "`\n\n";
        for(var i = 1; (10 * page + i) < server.queue.length && i <= 10; i++){
            var timeString = server.queue[i + 10 * page].stream ? "Live" : prettyMs(server.queue[i + 10 * page].time, {secDecimalDigits: 0});
            
            queueS += "`[" + (i + 10 * page) + "]` " + server.queue[i + 10 * page].title + " by " + server.queue[i + 10 * page].author + " `" + timeString + "`\n";
        }

        queueS += "\nUse the Queue command with a page number to see other pages";
        message.channel.send(queueS);
    }
}