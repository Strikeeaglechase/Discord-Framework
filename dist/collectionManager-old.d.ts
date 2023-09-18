import { Collection, DeleteWriteOpResultObject, FilterQuery, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from "mongodb";
import Database from "./database.js";
interface Encoder<DataType, SerializedData> {
    toDb: (obj: DataType) => SerializedData;
    fromDb: (obj: SerializedData) => DataType;
}
interface DBStorage<IDType, T> {
    init(): Promise<void>;
    get(): Promise<T[]>;
    get(id: IDType): Promise<T>;
    add(obj: T): Promise<InsertOneWriteOpResult<WithId<T>>>;
    update(obj: T, id: IDType): Promise<UpdateWriteOpResult>;
    remove(id: IDType): Promise<DeleteWriteOpResultObject>;
}
declare class CollectionManager<IDType, DataType> implements DBStorage<IDType, DataType> {
    database: Database;
    collection: Collection<DataType>;
    archive: Collection<DataType>;
    useCache: boolean;
    collectionName: string;
    cache: DataType[];
    idProp: string;
    constructor(database: Database, collectionName: string, cache: boolean, idProp: string);
    init(): Promise<void>;
    getLookup(id: IDType): FilterQuery<DataType>;
    updateCache(): Promise<void>;
    getCached(): DataType[];
    get(): Promise<DataType[]>;
    get(id: IDType): Promise<DataType>;
    add(obj: DataType): Promise<InsertOneWriteOpResult<any>>;
    update(obj: DataType, id: IDType): Promise<UpdateWriteOpResult>;
    remove(id: IDType): Promise<DeleteWriteOpResultObject>;
}
declare class EncodedCollectionManager<IDType, DataType, SerializedData> implements DBStorage<IDType, DataType> {
    dbManager: CollectionManager<IDType, SerializedData>;
    encoder: Encoder<DataType, SerializedData>;
    constructor(database: Database, collectionName: string, cache: boolean, idProp: string, encoder: Encoder<DataType, SerializedData>);
    init(): Promise<void>;
    get(): Promise<DataType[]>;
    get(id: IDType): Promise<DataType>;
    add(obj: DataType): Promise<InsertOneWriteOpResult<any>>;
    update(obj: DataType, id: IDType): Promise<UpdateWriteOpResult>;
    remove(id: IDType): Promise<DeleteWriteOpResultObject>;
}
export { CollectionManager, EncodedCollectionManager, Encoder };
