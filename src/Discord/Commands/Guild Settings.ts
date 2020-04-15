import { Command, Server } from "../Discord"
import { Message, MessageEmbed } from "discord.js";
import { getDragonite } from "../../Index";

class Settings implements Command {
    description = "Hello World";
    name = "settings";
    async run(message: Message, server: Server, args: string[], mentionTrigger: Boolean) {
        let toSend : MessageEmbed = new MessageEmbed();
        
        toSend.setTitle(`${message.guild.name}'s Settings`);
        toSend.setColor(message.guild.me.displayColor);
        toSend.setThumbnail(message.guild.iconURL());
        
        switch (args.length) {
            case 1:
                toSend.setDescription(`
                    Prefix: \`${server.prefix}\`
                `);

                toSend.addField("Set properties", `Use \`${server.prefix}settings set <property> <value>\` to set an option. If setting a channel, use #channel-name as the value.`);
                toSend.addField("Clear properties", `Use \`${server.prefix}settings clear <property>\` to reset that property to default.`)
                break;
            case 2:
                if (args[1].toLowerCase() != "clear" && args[1].toLowerCase() != "set") {
                    toSend.setDescription("Invalid action given");
                } else {
                    toSend.setDescription("No property was given");
                }
                break;
            default:
                if(args[1].toLowerCase() == "clear") {
                    toSend.setDescription(handleClear(args, server));
                } else if (args[1].toLowerCase() == "set") {
                    toSend.setDescription(handleSet(args, server));
                    
                } else {
                    toSend.setDescription("Invalid action given");
                }
                break;
        }

        message.channel.send({embed: toSend});
    }
}

function handleSet (args: string[], server: Server) : string {
    // Additional checks/manipulations on this maybe?
    let property : string = args[2].toLowerCase();

    // Check first as splice shortens array
    if(args.length < 4) return "No value given";

    let value : string = args.splice(3).join("");

    switch (property) {
        case "prefix":
            if (checkPrefix(value)) {
                server.prefix = value;
                return `Prefix set to \`${server.prefix}\``;
            } else {
                return "Invalid prefix - Must be between 1-5 characters long and not have any mentions";
            }
        default:
            return `${property.toUpperCase()} is not a valid option to set`;
    }
}

function handleClear (args: string[], server: Server) : string {
    let property : string = args.splice(2).join("").toLowerCase();

    if(server[property] == undefined) {
        return "Invalid property to reset";
    } else {
        server[property] = 
            getDragonite().serverConfigs.get("DEFAULT")[property];
        return `${property.toUpperCase()} was reset`;
    }
}

function checkPrefix (input: string) {
    return input.length < 5 && input.length > 0;
}

function enabledEmoji(opt : boolean) {
    return opt ? ":white_check_mark:" : ":x:"
}

let cmds = [
    Settings
];
export default cmds;