// This file defines a manager wrapper around mongoDB "Collections", they allow custom ID type/prop names
import Database from "./database.js";
import { Collection, DeleteWriteOpResultObject, FilterQuery, InsertOneWriteOpResult, OptionalId, UpdateWriteOpResult, WithId } from "mongodb";
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
class CollectionManager<IDType, DataType> implements DBStorage<IDType, DataType> {
	database: Database;
	collection: Collection<DataType>;
	// All values deleted are archived just in case
	archive: Collection<DataType>;
	useCache: boolean;
	collectionName: string;
	cache: DataType[];
	idProp: string;
	// "idProp" is the name of the property on the object used as its uid, by default mongoDB uses _id with "ObjectID" type, but it can be anthing here
	constructor(database: Database, collectionName: string, cache: boolean, idProp: string) {
		this.useCache = cache;
		this.database = database;
		this.collectionName = collectionName;
		this.idProp = idProp;
	}
	// Creates the collections and fills the cache if its being used
	async init() {
		this.collection = this.database.db.collection<DataType>(this.collectionName);
		this.archive = this.database.db.collection<DataType>(this.collectionName + "Archive");
		if (this.useCache) await this.updateCache();
	}
	// WARN: This function returns {idProp: id} (example: {_id: "abc"}) 
	// however the return type is very different to work with MongoDB
	getLookup(id: IDType) {
		// Using a record here feels a bit weird as its only one prop, but gets the job done
		const obj: Record<string, IDType> = {};
		obj[this.idProp] = id;
		return obj as FilterQuery<DataType>;
	}
	// Fills the cache
	async updateCache() {
		this.cache = await this.get();
	}
	// Syncronusly returns cached values
	getCached(): DataType[] {
		return this.cache;
	}
	// Either returns all items, or one item by ID from the collection
	async get(): Promise<DataType[]>;
	async get(id: IDType): Promise<DataType>
	async get(id?: IDType): Promise<DataType | DataType[]> {
		if (!id) {
			return await this.collection.find({}).toArray();
		}
		return await this.collection.findOne(this.getLookup(id));
	}
	// Inserts an item into the collection
	async add(obj: DataType): Promise<InsertOneWriteOpResult<any>> {
		const res = await this.collection.insertOne(obj as OptionalId<DataType>);
		if (this.useCache) await this.updateCache();
		return res;
	}
	// Updates an item in the collection (adds the item if it dosnt exist)
	async update(obj: DataType, id: IDType): Promise<UpdateWriteOpResult> {
		const res = await this.collection.updateOne(this.getLookup(id), { $set: obj }, { upsert: true });
		if (this.useCache) await this.updateCache();
		return res;
	}
	// Removes an item from the collection and moves it to the cache
	async remove(id: IDType): Promise<DeleteWriteOpResultObject> {
		const item = await this.get(id);
		if (!item) return;
		await this.archive.insertOne(item as OptionalId<DataType>);
		const res = await this.collection.deleteOne(this.getLookup(id));
		if (this.useCache) await this.updateCache();
		return res;
	}
}
class EncodedCollectionManager<IDType, DataType, SerializedData> implements DBStorage<IDType, DataType> {
	dbManager: CollectionManager<IDType, SerializedData>;
	encoder: Encoder<DataType, SerializedData>
	constructor(database: Database, collectionName: string, cache: boolean, idProp: string, encoder: Encoder<DataType, SerializedData>) {
		this.dbManager = new CollectionManager(database, collectionName, cache, idProp);
		this.encoder = encoder;
	}
	async init() {
		await this.dbManager.init();
	}
	// Either returns all items, or one item by ID from the collection
	async get(): Promise<DataType[]>;
	async get(id: IDType): Promise<DataType>
	async get(id?: IDType): Promise<DataType | DataType[]> {
		const item = await this.dbManager.get(id) as SerializedData | SerializedData[];
		if (Array.isArray(item)) {
			return item.map(itm => this.encoder.fromDb(itm));
		}
		return this.encoder.fromDb(item);
	}
	async add(obj: DataType) {
		const item = this.encoder.toDb(obj);
		return await this.dbManager.add(item);
	}
	async update(obj: DataType, id: IDType) {
		const item = this.encoder.toDb(obj);
		return await this.dbManager.update(item, id);
	}
	async remove(id: IDType) {
		return await this.dbManager.remove(id);
	}
}

export { CollectionManager, EncodedCollectionManager, Encoder };