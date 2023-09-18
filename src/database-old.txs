import MongoDBPkg from "mongodb";

import { CollectionManager, EncodedCollectionManager, Encoder } from "./collectionManager.js";
// This file defines a 'database' class which is a wrapper around the MongoDB database
import { DatabaseOptions } from "./interfaces.js";
import Logger from "./logger.js";

const {
	MongoClient,
} = MongoDBPkg;

class Database {
	db: MongoDBPkg.Db;
	log: Logger;
	options: DatabaseOptions;
	constructor(opts: DatabaseOptions, log: Logger) {
		this.log = log;
		this.options = opts;
	}
	// Connects to the mongoDB database
	init() {
		this.log.info("Database init started");
		const self = this;
		return new Promise<void>((res) => {
			MongoClient.connect(
				this.options.url,
				{ useUnifiedTopology: true },
				async (err, client) => {
					if (err) {
						self.log.error(err);
						return;
					}
					await self.onReady(client);
					res();
				}
			);
		});
	}
	// Called when a connection has successfully been made to the database
	async onReady(client: MongoDBPkg.MongoClient) {
		this.db = client.db(this.options.databaseName);
		this.log.info("Database client connected");
	}
	// Creates a new collection manager and returns it
	async collection<IDType, DataType>(collectionName: string, useCache: boolean, idProp: string): Promise<CollectionManager<IDType, DataType>> {
		this.log.info(`Initializing collection manager for ${collectionName}. Caching: ${useCache}, ID Property: ${idProp}`);
		const newCollection = new CollectionManager<IDType, DataType>(this, collectionName, useCache, idProp);
		await newCollection.init();
		this.log.info(`Init finished, ${newCollection.collection.collectionName} and ${newCollection.archive.collectionName} are ready to be used`);
		return newCollection;
	}
	async encodedCollection<IDType, DataType, SerializedData>(
		collectionName: string,
		useCache: boolean,
		idProp: string,
		encoder: Encoder<DataType, SerializedData>
	): Promise<EncodedCollectionManager<IDType, DataType, SerializedData>> {
		this.log.info(`Initializing encoded collection manager for ${collectionName}. Caching: ${useCache}, ID Property: ${idProp},`);
		const newCollection = new EncodedCollectionManager<IDType, DataType, SerializedData>(this, collectionName, useCache, idProp, encoder);
		await newCollection.init();
		this.log.info(`Init finished, ${newCollection.dbManager.collection.collectionName} and ${newCollection.dbManager.archive.collectionName} are ready to be used`);
		return newCollection;
	}
}
export default Database;