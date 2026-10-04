import { MongoClient, type Collection, type Db, type Document } from 'mongodb';

export class MongoDbCollectionRepositoryAdapter {
  private databasePromise?: Promise<Db>;
  private client?: MongoClient;

  constructor(private readonly uri: string) {}

  getDatabase(): Promise<Db> {
    this.databasePromise ??= (async () => {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      return this.client.db();
    })();
    return this.databasePromise;
  }

  async getCollection<TDocument extends Document>(name: string): Promise<Collection<TDocument>> {
    return (await this.getDatabase()).collection<TDocument>(name);
  }

  async close(): Promise<void> {
    await this.client?.close();
  }
}
