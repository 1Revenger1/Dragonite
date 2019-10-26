import { Command, Server } from "../../Discord"
import { Message } from "discord.js";

export default class Ping implements Command {
    description = "Hello World";
    run(message: Message, server: Server, args: String[], mentionTrigger: Boolean) {
        message.channel.send("No settings yet...");
    }
}