module.exports = {
    name: "doubt",
    aliases: [],    
    helpDesc: "doubt.png",
    helpTitle: "Doubt",
    ignore: false,
    run: async (bot, message, args) => {
        message.channel.send({

            files: [{
                attachment: './images/doubt.png',
                name: 'doubt.png'
            }]
        });
        
        message.delete();
    }
}