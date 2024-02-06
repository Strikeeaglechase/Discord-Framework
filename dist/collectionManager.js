class CollectionManager {
    database;
    collection;
    // All values deleted are archived just in case
    archive;
    useCache;
    collectionName;
    cache;
    idProp;
    // "idProp" is the name of the property on the object used as its uid, by default mongoDB uses _id with "ObjectID" type, but it can be anthing here
    constructor(database, collectionName, cache, idProp) {
        this.useCache = cache;
        this.database = database;
        this.collectionName = collectionName;
        this.idProp = idProp;
    }
    // Creates the collections and fills the cache if its being used
    async init() {
        this.collection = this.database.db.collection(this.collectionName);
        this.archive = this.database.db.collection(this.collectionName + "Archive");
        if (this.useCache)
            await this.updateCache();
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
    async updateCache() {
        this.cache = await this.get();
    }
    // Syncronusly returns cached values
    getCached() {
        return this.cache;
    }
    async get(id) {
        if (!id) {
            return await this.collection.find({}).toArray();
        }
        return await this.collection.findOne(this.getLookup(id));
    }
    // Inserts an item into the collection
    async add(obj) {
        const res = await this.collection.insertOne(obj);
        if (this.useCache)
            await this.updateCache();
        return res;
    }
    // Updates an item in the collection (adds the item if it dosnt exist)
    async update(obj, id) {
        const res = await this.collection.updateOne(this.getLookup(id), { $set: obj }, { upsert: true });
        if (this.useCache)
            await this.updateCache();
        return res;
    }
    // Removes an item from the collection and moves it to the cache
    async remove(id) {
        const item = await this.get(id);
        if (!item)
            return;
        await this.archive.insertOne(item);
        const res = await this.collection.deleteOne(this.getLookup(id));
        if (this.useCache)
            await this.updateCache();
        return res;
    }
}
// Hehe we do a bit of casting
// Seriously though this needs to be rethought, encoded collections are barely used, do we really need to 1:1 implement the DBStorage interface?
class EncodedCollectionManager {
    dbManager;
    encoder;
    constructor(database, collectionName, cache, idProp, encoder) {
        this.dbManager = new CollectionManager(database, collectionName, cache, idProp);
        this.encoder = encoder;
    }
    async init() {
        await this.dbManager.init();
    }
    async get(id) {
        const item = await this.dbManager.get(id);
        if (Array.isArray(item)) {
            return item.map(itm => this.encoder.fromDb(itm));
        }
        return this.encoder.fromDb(item);
    }
    async add(obj) {
        const item = this.encoder.toDb(obj);
        return await this.dbManager.add(item);
    }
    async update(obj, id) {
        const item = this.encoder.toDb(obj);
        return await this.dbManager.update(item, id);
    }
    async remove(id) {
        return await this.dbManager.remove(id);
    }
}
export { CollectionManager, EncodedCollectionManager };
