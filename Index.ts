import { Collection, Client, TextChannel } from "discord.js";
import { Command, Server } from "./Discord/Discord";
import { handleMessage, loadCommands } from "./Discord/CommandHandler";
import { guildCreate, guildDelete } from "./Discord/Guild";
import RethinkDB from "rethinkdb";
import env from "dotenv";

env.config();

const DB_DEFAULT : number = 28015;
const GAME_TIMER : number = 120000;

class Preferences {
    ownerID : string = process.env.OWNER_ID;
    defaultPrefix : string = process.env.DEFAULT_PREFIX;
    defaultVolume : number = +process.env.DEFAULT_VOLUME;
}

class DiscordBot extends Client{
    commands : {};
    servers : Collection<string, Server>;
    isBeta : boolean = false;
    portalChannel : TextChannel;
    rethinkDB : any = RethinkDB;
    prefs : Preferences;
    private started : boolean = false;
    private gameTimer : NodeJS.Timeout;
    private timer : number = 0;

    constructor() {
        super();
        this.commands = loadCommands();
        this.servers = new Collection<string, Server>();

        if("" + process.argv.slice(2) == '-b') {
            this.isBeta = true;
        }

        this.login(this.isBeta ? process.env.BETA_DISCORD_AUTH : process.env.DISCORD_AUTH);
        this.on("ready", this.handleReady);
    }

    private handleReady() : void {
        log("Ready event fired!");
        if(this.started) return error("Dragonite already started");

        this.started = true;

        this.on("message", handleMessage);
        this.on("guildCreate", guildCreate);
        this.on("guildDelete", guildDelete);
        this.gameTimer = setInterval(this.changeGame, GAME_TIMER);
        this.changeGame();
    }

    private changeGame() {
        let serverNumber = this.guilds.size;
        let games = ["with other sentient bots...what?",
                 "Use '@Dragonite help' for commands",
                 (`I'm in ${serverNumber} guilds!`),
                 "music for people!"]
        this.timer++;
        this.timer %= games.length;

        this.user.setActivity(games[this.timer]);
    }
}

const Bot = new DiscordBot();

export function getDragonite() : DiscordBot {
    return Bot;
}

export function error(message : string){
    console.error(new Date().toISOString() + ": " + message);
}

export function log(message : string){
    console.log(new Date().toISOString() + ": " + message);
}