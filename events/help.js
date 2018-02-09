const Discord = require('discord.js');

exports.run = (client, message, args, isBeta, db) => {
    var dragonite = null;
    if(isBeta){
        dragonite = `../DragoniteBeta.js`;
    } else {
        dragonite = `../Dragonite.js`;
    }

    const server = require(dragonite).servers[message.guild.id];
    
    function help(message){
		var embedGen = new Discord.MessageEmbed()
			.setColor('#E81F2F')
			.setTitle('Dragonite Commands')
			//Fields
			.addField("Version", "Prints out the current version of Dragonite")
			.addField("Ping", "Return Dragonite\'s response time")
			.addField("Invite", "Gives the invite link to add Dragonite to your server")
			.addField("Github", "Gives the Github link for Dragonite")
			.addField("Role <optional:Role Name>", "Will give a list of self-assignable roles unless you give it a role you want")
			.addField("Help Music", "Commands for playing music")
			.addField("Help Administrator", "Commands for Administrators");

		message.channel.send({embed: embedGen});
	}

	function helpMusic(message){
		var embedMus = new Discord.MessageEmbed()
			.setColor('#E81F2F')
			.setTitle('Dragonite Music Commands')
			//Music Commands
			.addField("Join", "Makes Dragonite join the current voice channel you are in")
			.addField("Play <URL> <optional: timestamp (ex: 30h20m30s)>", "Streams music from youtube video or playlist link to voice channel Dragonite is in and adds it to the queue")
			.addField("Search <Search terms>", "Searches youtube for video, then plays first result.")
			.addField("NowPlaying, np", "Gives information about the song currently playing")
			.addField("Skip", "Vote to skip the current song")
			.addField("Stop", "Stops Dragonite streaming and forces it to leave the voice channel")
			.addField("Pause", "Pauses playback of the stream")
			.addField("Resume, Unpause", "Resumes playback of the stream")
			.addField("Queue <optional: page>", "Returns the current queue")
			.addField("Shuffle", "Shuffles the current playlist")
			.addField("Loop <Integer between 1 and 5>", "Adds the current song to the very front of the queue to effectively loop it the number of times requested")
			.addField("Volume <number out of 100>", "Changes the volume of playback. Only applies when next video begins");

		message.channel.send({embed: embedMus});
	}

	function helpAdmin(message){
		var embedAdmin = new Discord.MessageEmbed()
			.setColor('#E81F2F')
			.setTitle('Administrative Commands')
			//Administrative Commands
			.addField("Skip Override", "Overrides the voting within the music skip command, forcing a skip")
			.addField("addRole <Name of Role>", "Adds role to the list of self-assignable roles")
			.addField("removeRole <Name of Role>", "Removes role from list of self-assignable roles")
			.addField("Options <optional:option> <optional:value>", "Allows Administrators to set server options")
			.addField("ChangePrefix <new prefix>", "Allows members with the Administrator permission to change the prefix for the server")
			.addField("Prefix", "Returns current prefix saved for this server");
				
		message.channel.send({embed: embedAdmin});
	}
	
	if(!args[1]){
		help(message);
		return;
	}
	
	if(args[1].toLowerCase() == 'music'){
		helpMusic(message);
		return;
	} else if(args[1].toLowerCase() == 'administrator'){
		helpAdmin(message);
		return;
	}
}