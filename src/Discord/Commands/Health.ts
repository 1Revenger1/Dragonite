import { Command, Server } from "../Discord"
import { Message } from "discord.js";
import { getDragonite } from "../../Index";

class Ping implements Command {
    description = "Hello World";
    name = "ping";
    async run(message: Message, server: Server, args: String[], mentionTrigger: Boolean) {
        let ping1 = message.createdTimestamp;
        let msg = await message.channel.send('Pinging...')

        let ping2 = msg.createdTimestamp - ping1;

        try{
            msg.edit('Pong! Message ping was ' + ping2 + ' ms. The Websocket ping was ' + getDragonite().ws.ping.toFixed(0) + ' ms.');
        } catch(err) {
            msg.edit('Pinging... That didn\'t quite work.');
        }    
    }
}

let cmds = [
    Ping
];
export default cmds;