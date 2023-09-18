import { Collection, DeleteResult, Filter, InsertOneResult, UpdateResult } from "mongodb";
import Database from "./database.js";
interface Encoder<DataType, SerializedData> {
    toDb: (obj: DataType) => SerializedData;
    fromDb: (obj: SerializedData) => DataType;
}
interface DBStorage<T, IDType extends string = string> {
    init(): Promise<void>;
    get(): Promise<T[]>;
    get(id: IDType): Promise<T>;
    add(obj: T): Promise<InsertOneResult<T>>;
    update(obj: T, id: IDType): Promise<UpdateResult>;
    remove(id: IDType): Promise<DeleteResult>;
}
declare class CollectionManager<T, IDType extends string = string> implements DBStorage<T, IDType> {
    database: Database;
    collection: Collection<T>;
    archive: Collection<T>;
    useCache: boolean;
    collectionName: string;
    cache: T[];
    idProp: string;
    constructor(database: Database, collectionName: string, cache: boolean, idProp: string);
    init(): Promise<void>;
    getLookup(id: IDType): Filter<T>;
    updateCache(): Promise<void>;
    getCached(): T[];
    get(): Promise<T[]>;
    get(id: IDType): Promise<T>;
    add(obj: T): Promise<InsertOneResult<T>>;
    update(obj: T, id: IDType): Promise<UpdateResult>;
    remove(id: IDType): Promise<DeleteResult>;
}
declare class EncodedCollectionManager<T, SerializedData, IDType extends string = string> implements DBStorage<T, IDType> {
    dbManager: CollectionManager<SerializedData, IDType>;
    encoder: Encoder<T, SerializedData>;
    constructor(database: Database, collectionName: string, cache: boolean, idProp: string, encoder: Encoder<T, SerializedData>);
    init(): Promise<void>;
    get(): Promise<T[]>;
    get(id: IDType): Promise<T>;
    add(obj: T): Promise<InsertOneResult<T>>;
    update(obj: T, id: IDType): Promise<UpdateResult<import("bson").Document>>;
    remove(id: IDType): Promise<DeleteResult>;
}
export { CollectionManager, EncodedCollectionManager, Encoder };
