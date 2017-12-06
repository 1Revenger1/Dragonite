exports.run = (client, message, args, isBeta, db) => {
    const YouTube = require("discord-youtube-api");
 
	const youtube = new YouTube("AIzaSyCJ5oL897AnJ6-TNzP_8C-kJZOoICv_5jE");
	testAll();
 
	async function testAll() {
    const videoArray2 = await youtube.getPlaylistByID("PL68HMEFGEr9ApyawyfByQZZ2Jc9-Br3RD");
 
    console.log(videoArray2);
}
}