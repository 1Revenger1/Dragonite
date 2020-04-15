import { Collection, Client, TextChannel } from "discord.js";
import { Server } from "./Discord/Discord";
import { CommandHandler } from "./Discord/CommandHandler";
import { guildCreate, guildDelete } from "./Discord/Guild";
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

    serverConfigs : Collection<string, Server>;
    isBeta : boolean = false;
    portalChannel : TextChannel;
    prefs : Preferences;
    commandHandler : CommandHandler;
    private started : boolean = false;
    private gameTimer : NodeJS.Timeout;
    private timer : number = 0;

    constructor() {
        super();

        this.serverConfigs = new Collection<string, Server>();
        this.serverConfigs.set("DEFAULT", new Server());

        this.commandHandler = new CommandHandler();
        this.login(process.env.DISCORD_AUTH);
        this.on("ready", this.handleReady.bind(this));
    }

    private handleReady() : void {
        log("DRG - Ready event fired!");
        if(this.started) return error("DRG - Dragonite already started");

        this.started = true;

        this.on("message", this.commandHandler.handleMessage.bind(this.commandHandler));
        this.on("guildCreate", guildCreate);
        this.on("guildDelete", guildDelete);
        this.gameTimer = setInterval(this.changeGame.bind(this), GAME_TIMER);
        this.changeGame();
    }

    private changeGame() {
        let serverNumber = this.guilds.cache.size; // Cache becomes null?
        // let serverNumber = this.serverConfigs.size;
        let games = ["with other sentient bots...what?",
                 "Use '@Dragonite help' for commands",
                 (`I'm in ${serverNumber} guilds!`),
                 "music for people!"]
        this.timer++;
        this.timer %= games.length;

        this.user.setActivity(games[this.timer]);
    }
}

export function getDragonite() : DiscordBot {
    return Bot;
}

export function error(message : string){
    console.error(new Date().toISOString() + ": " + message);
}

export function log(message : string){
    console.log(new Date().toISOString() + ": " + message);
}

const Bot = new DiscordBot();