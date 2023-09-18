var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import MongoDBPkg from "mongodb";
import { CollectionManager, EncodedCollectionManager } from "./collectionManager.js";
const { MongoClient, } = MongoDBPkg;
class Database {
    constructor(opts, log) {
        this.log = log;
        this.options = opts;
    }
    // Connects to the mongoDB database
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("Database init started");
            try {
                const client = yield MongoClient.connect(this.options.url);
                this.db = client.db(this.options.databaseName);
                this.log("Database client connected");
                return true;
            }
            catch (e) {
                this.log(`Database init failed: ${e.toString()}`);
                this.log(e);
                return false;
            }
        });
    }
    // Creates a new collection manager and returns it
    collection(collectionName, useCache, idProp) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Initializing collection manager for ${collectionName}. Caching: ${useCache}, ID Property: ${idProp}`);
            const newCollection = new CollectionManager(this, collectionName, useCache, idProp);
            yield newCollection.init();
            this.log(`Init finished, ${newCollection.collection.collectionName} and ${newCollection.archive.collectionName} are ready to be used`);
            return newCollection;
        });
    }
    encodedCollection(collectionName, useCache, idProp, encoder) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Initializing encoded collection manager for ${collectionName}. Caching: ${useCache}, ID Property: ${idProp},`);
            const newCollection = new EncodedCollectionManager(this, collectionName, useCache, idProp, encoder);
            yield newCollection.init();
            this.log(`Init finished, ${newCollection.dbManager.collection.collectionName} and ${newCollection.dbManager.archive.collectionName} are ready to be used`);
            return newCollection;
        });
    }
}
export default Database;
