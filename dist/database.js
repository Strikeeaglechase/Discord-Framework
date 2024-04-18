import MongoDBPkg from "mongodb";
import { CollectionManager, EncodedCollectionManager } from "./collectionManager.js";
const { MongoClient } = MongoDBPkg;
class Database {
    db;
    log;
    options;
    client;
    constructor(opts, log) {
        this.log = log;
        this.options = opts;
    }
    // Connects to the mongoDB database
    async init() {
        this.log("Database init started");
        try {
            this.client = await MongoClient.connect(this.options.url);
            this.db = this.client.db(this.options.databaseName);
            this.log("Database client connected");
            return true;
        }
        catch (e) {
            this.log(`Database init failed: ${e.toString()}`);
            this.log(e);
            return false;
        }
    }
    // Creates a new collection manager and returns it
    async collection(collectionName, useCache, idProp) {
        this.log(`Initializing collection manager for ${collectionName}. Caching: ${useCache}, ID Property: ${String(idProp)}`);
        const newCollection = new CollectionManager(this, collectionName, useCache, String(idProp));
        await newCollection.init();
        this.log(`Init finished, ${newCollection.collection.collectionName} and ${newCollection.archive.collectionName} are ready to be used`);
        return newCollection;
    }
    async encodedCollection(collectionName, useCache, idProp, encoder) {
        this.log(`Initializing encoded collection manager for ${collectionName}. Caching: ${useCache}, ID Property: ${idProp},`);
        const newCollection = new EncodedCollectionManager(this, collectionName, useCache, idProp, encoder);
        await newCollection.init();
        this.log(`Init finished, ${newCollection.dbManager.collection.collectionName} and ${newCollection.dbManager.archive.collectionName} are ready to be used`);
        return newCollection;
    }
}
export default Database;
