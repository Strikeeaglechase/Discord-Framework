import FrameworkClient from "./app.js";
interface PermissionEntry {
    name: string;
    allow: string[];
    public: boolean;
}
declare class PermissionManager {
    private framework;
    private permissions;
    private tracks;
    private paths;
    constructor(framework: FrameworkClient);
    get permNames(): string[];
    init(): Promise<void>;
    loadPerms(permissionNames: string[]): Promise<void>;
    setPublic(name: string, pub: boolean): Promise<void>;
    grant(name: string, id: string): Promise<boolean>;
    remove(name: string, id: string): Promise<boolean>;
    getPermission(name: string): Promise<PermissionEntry>;
    private getUserRoles;
    clearUserTracks(userId: string): void;
    check(userId: string, chain: string): Promise<boolean>;
}
export { PermissionManager, PermissionEntry };
