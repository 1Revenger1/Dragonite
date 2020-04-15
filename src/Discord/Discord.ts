import { Message, Role } from "discord.js";

export enum PermissionType {
    OWNER,
    USER_ID,
    GUILD_PERMISSION
}

/**
 * Stores Permission type as well as any value needed for that
 */
interface Permission {
    type: PermissionType;
    value ?: any;
}

/**
 * A command which can be triggered by a user.
 * This stores help information as well as a @Permission
 */
export interface Command {
    name : string;
    description : string;
    aliases ?: string[];
    category ?: string;
    permissionReq ?: Permission;
    run(message : Message, server : Server, args : string[], mentionTrigger : boolean) : void;
}

export class Server {
    prefix : string = process.env.DEFAULT_PREFIX ? process.env.DEFAULT_PREFIX : ";;";
    volume : number = 50;

    selfAssignOn : boolean = false;
    selfAssignRoles : string[];
}