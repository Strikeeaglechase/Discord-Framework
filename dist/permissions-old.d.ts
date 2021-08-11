import { Role } from "discord.js";
import FrameworkClient from "./app.js";
import { CollectionManager } from "./collectionManager.js";
declare type PermissionMode = "whitelist" | "blacklist";
interface PermissionEntry {
    name: string;
    ids: string[];
    mode: PermissionMode;
}
declare class PermissionManager {
    framework: FrameworkClient;
    permissions: CollectionManager<string, PermissionEntry>;
    perms: Record<string, Permission>;
    permissionNames: string[];
    private roleCache;
    constructor(framework: FrameworkClient, permissions: string[]);
    init(): Promise<void>;
    updateRoleCache(userID: string, serverID: string, roles: Role[]): Promise<void>;
    getUserRoles(id: string): Promise<string[]>;
    private makeCacheEntry;
    get(permName: string): Permission;
}
declare class Permission implements PermissionEntry {
    manager: PermissionManager;
    name: string;
    ids: string[];
    mode: PermissionMode;
    constructor(manager: PermissionManager, name: string);
    init(): Promise<void>;
    allow(id: string): Promise<void>;
    deny(id: string): Promise<void>;
    has(id: string): boolean;
    check(userID: string): Promise<boolean>;
    private sync;
}
export default PermissionManager;
