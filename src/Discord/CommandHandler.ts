import { Message, DMChannel } from "discord.js";
import { getDragonite, log, error } from "../Index";
import { Server, Command, PermissionType } from "./Discord";
import { readdirSync, PathLike, Dirent } from "fs";

let errorID : number = 0;

export class CommandHandler {
    commands : Map<String, Command>;

    constructor() {
        log(`CH - Loading commands`);
        this.commands = loadDir('/Commands/', new Map<String, Command>());
        log(`CH - Loaded ${this.commands.size} commands`);
    }

    handleMessage(message : Message) {
    
        if(message.author.bot || !message.content) return;
    
        if(message.channel instanceof DMChannel){    
            message.reply("Dragonite does not respond to DMs");
            return;
        }
    
        if(!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
    
        let server : Server = getDragonite().serverConfigs.get(message.guild.id);
    
        if(server == null) {
            server = new Server();
            getDragonite().serverConfigs.set(message.guild.id, server);
        }

        let prefixTrigger : boolean = message.content.startsWith(server.prefix); //server.prefix);
        let mentionTrigger : boolean = message.mentions.members[0] == message.guild.member;
    
        // Return silently, don't tell the user that bot wasn't called.
        if(!prefixTrigger && !mentionTrigger) return;
    
        let args : string[] = message.content.split(" ");
    
        if(prefixTrigger) args[0] = args[0].replace(server.prefix, "");
        if(mentionTrigger) {
            args.shift();
            // TODO: Get rid of Dragonite from mention list
        }
    
        //Get the command now that we know for sure Dragonite is being told to do stuff
        let command = this.getCommand(args);
        if(command == null) return;
    
        try{
            message.channel.startTyping();
    
            if(command.permissionReq) {
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
            }
    
            log(`CH - Command ran (${command.name}, guild: ${message.guild.id})`)
            command.run(message, server, args, mentionTrigger);
    
            message.channel.stopTyping();
            //Run Commands
        } catch (err) {
            //Handle errors -> Display error message and show that it's been logged
            errorID++;
            error(`CH - (${errorID})` + err);
        }
    }    
    
    getCommand(args: string[]) {
        if (this.commands.has(args[0])) {
            return this.commands.get(args[0]);
        } else return null;
    }
}

function loadDir(folder: PathLike, toFill: Map<String,Command>) {
    let files: Dirent[] = readdirSync(__dirname + folder, {
        withFileTypes: true,
    });

    files.forEach((file: Dirent) => {
        if(!file.isDirectory()) {
            let cmdFile = require(__dirname + folder + file.name).default;
            if(cmdFile instanceof Array) {
                cmdFile.forEach(check => {
                    let cmd = new check();
                    cmd.category = file.name.replace(".js", "");
                    // Assume command as I can't do an instanceof check here :(
                    toFill.set(cmd.name, cmd);
                });
            } else {
                error(`CH - ${file.name} has no commands!`);
            }
        }
    });

    console.log(toFill);

    return toFill;
}