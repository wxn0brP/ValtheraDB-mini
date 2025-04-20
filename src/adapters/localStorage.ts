import { SyncStorageAdapter } from "../types";

export default class LocalStorageAdapter implements SyncStorageAdapter {
    private prefix: string;

    constructor(prefix: string = "") {
        this.prefix = prefix;
    }

    getCollections(): string[] {
        const collections: string[] = [];
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith(this.prefix)) collections.push(key.slice(this.prefix.length));
        }
        return collections;
    }
    load(collection: string): object[] {
        const data = localStorage.getItem(`${this.prefix}${collection}`);
        return data ? JSON.parse(data) : [];
    }
    removeCollection(collection: string): void {
        localStorage.removeItem(`${this.prefix}${collection}`);
    }
    save(collection: string, data: object[]): void {
        localStorage.setItem(`${this.prefix}${collection}`, JSON.stringify(data));
    }
}
