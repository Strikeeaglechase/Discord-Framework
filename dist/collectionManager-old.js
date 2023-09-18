var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CollectionManager {
    // "idProp" is the name of the property on the object used as its uid, by default mongoDB uses _id with "ObjectID" type, but it can be anthing here
    constructor(database, collectionName, cache, idProp) {
        this.useCache = cache;
        this.database = database;
        this.collectionName = collectionName;
        this.idProp = idProp;
    }
    // Creates the collections and fills the cache if its being used
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.collection = this.database.db.collection(this.collectionName);
            this.archive = this.database.db.collection(this.collectionName + "Archive");
            if (this.useCache)
                yield this.updateCache();
        });
    }
    // WARN: This function returns {idProp: id} (example: {_id: "abc"}) 
    // however the return type is very different to work with MongoDB
    getLookup(id) {
        // Using a record here feels a bit weird as its only one prop, but gets the job done
        const obj = {};
        obj[this.idProp] = id;
        return obj;
    }
    // Fills the cache
    updateCache() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache = yield this.get();
        });
    }
    // Syncronusly returns cached values
    getCached() {
        return this.cache;
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return yield this.collection.find({}).toArray();
            }
            return yield this.collection.findOne(this.getLookup(id));
        });
    }
    // Inserts an item into the collection
    add(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.collection.insertOne(obj);
            if (this.useCache)
                yield this.updateCache();
            return res;
        });
    }
    // Updates an item in the collection (adds the item if it dosnt exist)
    update(obj, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.collection.updateOne(this.getLookup(id), { $set: obj }, { upsert: true });
            if (this.useCache)
                yield this.updateCache();
            return res;
        });
    }
    // Removes an item from the collection and moves it to the cache
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.get(id);
            if (!item)
                return;
            yield this.archive.insertOne(item);
            const res = yield this.collection.deleteOne(this.getLookup(id));
            if (this.useCache)
                yield this.updateCache();
            return res;
        });
    }
}
class EncodedCollectionManager {
    constructor(database, collectionName, cache, idProp, encoder) {
        this.dbManager = new CollectionManager(database, collectionName, cache, idProp);
        this.encoder = encoder;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dbManager.init();
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.dbManager.get(id);
            if (Array.isArray(item)) {
                return item.map(itm => this.encoder.fromDb(itm));
            }
            return this.encoder.fromDb(item);
        });
    }
    add(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.encoder.toDb(obj);
            return yield this.dbManager.add(item);
        });
    }
    update(obj, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.encoder.toDb(obj);
            return yield this.dbManager.update(item, id);
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dbManager.remove(id);
        });
    }
}
export { CollectionManager, EncodedCollectionManager };
