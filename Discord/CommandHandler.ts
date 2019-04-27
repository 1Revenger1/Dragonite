import { Message, TextChannel, DMChannel } from "discord.js";
import { getDragonite } from "../Index";
import { Server, Command, PermissionType } from "./Discord";

var errorID : number = 0;

export async function handleMessage(message : Message) : Promise<void> {
    
    // Do nothing if it's Dragonite itself. Oh god, imagine the feedback
    // Also do nothing if there is no content in the message
    if(message.author.id == getDragonite().client.user.id || !message.content) return;

    if(message.channel instanceof DMChannel){    
        //If it's a user, do nothing
        if(message.author.id != getDragonite().prefs.ownerID) {
            message.reply("Dragonite does not respond to DMs");
            return;
        }

        //else Portal stuff
        if(getDragonite().portalChannel != null)
            getDragonite().portalChannel.send(message.content);
        else
            message.channel.send("No active channels. Use ??portalStart && ??portalStop");
        
        return;
    }

    //Get around a compilation error which says .permissionsFor does not exist for DM channels
    if(!(message.channel instanceof TextChannel)) return;

    if(!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

    let server : Server = getDragonite().servers.get(message.guild.id);

    let prefixTrigger : boolean = message.content.startsWith(server.prefix);
    let mentionTrigger : boolean = message.content.startsWith(message.guild.me.toString());

    // Return silently, don't tell the user that bot wasn't called.
    if(!prefixTrigger && !mentionTrigger) return;

    let args : string[] = message.content.split(" ");

    if(prefixTrigger) args[0].replace(server.prefix, "");
    if(mentionTrigger) args.shift();

    //Get the command now that we know for sure Dragonite is being told to do stuff
    let command : Command;

    try{
        message.channel.startTyping();

        switch(command.permissionReq.type){
            case PermissionType.OWNER:
                if(message.author.id != getDragonite().prefs.ownerID){
                    message.channel.send("This can only be ran by the owner of Dragonite");
                    return;
                }

                break;
            case PermissionType.GUILD_PERMISSION:
                if(!message.member.hasPermission(command.permissionReq.value)){
                    message.channel.send("This can only be ran by someone with the `" + command.permissionReq.value + "` permission");
                    return;
                }
            default:
        }


        await command.run(message, server, args, mentionTrigger);

        message.channel.stopTyping();
        //Run Commands
    } catch (err) {
        //Handle errors -> Display error message and show that it's been logged
        errorID++;
    }

}