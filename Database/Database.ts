import { MongoClient, Db } from "mongodb";
import { getDragonite } from "../Index";

const SERVER_DB = process.env.SERVER_DB != null ? process.env.SERVER_DB : "Servers";

class Server {
    volume : number;
    prefix : string;

    constructor() {
        let prefs = getDragonite().prefs;
        
        this.volume = prefs.defaultVolume;
        this.prefix = prefs.defaultPrefix;
    }
}

class Database {
    client : MongoClient = new MongoClient(process.env.MONGO_URL);
    servers : Db;

    constructor() {
        this.servers = this.client.db(SERVER_DB);
    }

}
//Typescript shortcut
        let port : number = +process.env.DB_PORT.trim();
