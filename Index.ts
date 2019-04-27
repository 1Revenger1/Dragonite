import { Collection, Client, TextChannel } from "discord.js";
import { Command, Server } from "./Discord/Discord";
import { handleMessage } from "./Discord/CommandHandler";

interface Preferences {
    ownerID : string;
}

class DiscordBot {
    commands : Collection<string, Command>;
    subcommands : Collection<string, string>;
    servers : Collection<string, Server>;
    client : Client;
    started : boolean = false;
    portalChannel : TextChannel;

    prefs : Preferences;

    constructor() {
        this.client = new Client();
        this.client.login(process.env.DISCORD_AUTH);
        this.client.on("ready", this.handleReady);
    }

    private handleReady() : void {
        log("Ready event fired!");
        if(this.started) return error("Dragonite already started");

        this.started = true;

        this.client.on("message", handleMessage);
    }
}

const Bot = new DiscordBot();

export function getDragonite() : DiscordBot {
    return Bot;
}

export function error(message : string){
    console.error(new Date().toISOString + ": " + message);
}

export function log(message : string){
    console.log(new Date().toISOString + ": " + message);
}