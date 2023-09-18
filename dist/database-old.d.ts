import MongoDBPkg from "mongodb";
import { CollectionManager, EncodedCollectionManager, Encoder } from "./collectionManager.js";
import { DatabaseOptions } from "./interfaces.js";
import Logger from "./logger.js";
declare class Database {
    db: MongoDBPkg.Db;
    log: Logger;
    options: DatabaseOptions;
    constructor(opts: DatabaseOptions, log: Logger);
    init(): Promise<void>;
    onReady(client: MongoDBPkg.MongoClient): Promise<void>;
    collection<IDType, DataType>(collectionName: string, useCache: boolean, idProp: string): Promise<CollectionManager<IDType, DataType>>;
    encodedCollection<IDType, DataType, SerializedData>(collectionName: string, useCache: boolean, idProp: string, encoder: Encoder<DataType, SerializedData>): Promise<EncodedCollectionManager<IDType, DataType, SerializedData>>;
}
export default Database;
