import { Message, TextChannel, DMChannel, Collection } from "discord.js";
import { getDragonite } from "../Index";
import { Server, Command, PermissionType } from "./Discord";
import { readdirSync, PathLike, Dirent } from "fs";

let errorID : number = 0;

export function loadCommands() {
    return loadDir('/Commands/', {});
}

function loadDir(folder: PathLike, toFill: Object) {
    let files: Dirent[] = readdirSync('./Discord/' + folder, {
        withFileTypes: true,
    });
    
    files.forEach((file: Dirent) => {
        if(file.isDirectory()) {
            let directory = { };
            directory = loadDir(folder + file.name + "/", directory);
            toFill[file.name] = directory;
            toFill[file.name]["isDirectory"] = true;
        } else {
            let command = new (require('.' + folder + file.name).default)();
            if(command.run instanceof Function && command.description) {
                toFill[file.name.replace(".ts", "")] = command;
            }
        }
    });

    console.log(JSON.stringify(toFill, null, 2));

    return toFill;
}

export async function handleMessage(message : Message) : Promise<void> {
    
    if(message.author.bot || !message.content) return;

    if(message.channel instanceof DMChannel){    
        //If it's a user, respond that commands aren't accepted
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
    if(!(message.channel instanceof TextChannel) 
        || !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

    let server : Server = getDragonite().servers.get(message.guild.id);

    let prefixTrigger : boolean = message.content.startsWith(";;"); //server.prefix);
    let mentionTrigger : boolean = message.mentions.members[0] == message.guild.member;

    // Return silently, don't tell the user that bot wasn't called.
    if(!prefixTrigger && !mentionTrigger) return;

    let args : string[] = message.content.split(" ");

    if(prefixTrigger) args[0] = args[0].replace(";;", "");
    if(mentionTrigger) {
        args.shift();
        // TODO: Get rid of Dragonite from list
    }

    //Get the command now that we know for sure Dragonite is being told to do stuff
    let command = getCommand(args, 0, getDragonite().commands);
    if(command == null) return;

    try{
        message.channel.startTyping();

        if(command.permissionReq)
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

                    break;
                default:
            }

        await command.run(message, server, args, mentionTrigger);

        message.channel.stopTyping();
        //Run Commands
    } catch (err) {
        //Handle errors -> Display error message and show that it's been logged
        errorID++;
        console.log(err);
    }

}

function getCommand(args: string[], depth: number, currentDir) {
    // No command/folder - ...What do we do? Samurai, I need your help!
    if(!args[depth] || !currentDir[args[depth].toLowerCase()]) {
        // Phew, there's a default...
        if(depth > 0 && currentDir["__" + args[depth - 1].toLowerCase()]) 
            return currentDir["__" + args[depth - 1].toLowerCase()];

        // Welp there isn't anything here...I admit defeat...
        return null;
        
    // This arg leads to a directory - Samurai, we need to go deeper!
    } else if(currentDir[args[depth].toLowerCase()].isDirectory) {
        let command = getCommand(args, depth + 1, currentDir[args[depth].toLowerCase()]);
        
        // What do you mean you got nothing? Get the default for this dir...
        if(command == null) {
            if(currentDir["__" + args[depth].toLowerCase()])
                return currentDir["__" + args[depth].toLowerCase()];
            
            // Nvm, I give up
            return null;
        }

        return command;

    // It's a command! Return it at once Samurai!
    } else {
        return currentDir[args[depth].toLowerCase()];
    }
}