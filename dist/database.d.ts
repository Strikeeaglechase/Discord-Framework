import MongoDBPkg from "mongodb";
import { CollectionManager, EncodedCollectionManager, Encoder } from "./collectionManager.js";
interface DatabaseOptions {
    databaseName: string;
    url: string;
}
type Logger = (msg: string) => void;
declare class Database {
    db: MongoDBPkg.Db;
    log: Logger;
    options: DatabaseOptions;
    constructor(opts: DatabaseOptions, log: Logger);
    init(): Promise<boolean>;
    collection<T, IDType extends string = string>(collectionName: string, useCache: boolean, idProp: string): Promise<CollectionManager<T, IDType>>;
    encodedCollection<DataType, SerializedData, IDType extends string = string>(collectionName: string, useCache: boolean, idProp: string, encoder: Encoder<DataType, SerializedData>): Promise<EncodedCollectionManager<DataType, SerializedData, IDType>>;
}
export default Database;
export { DatabaseOptions };
