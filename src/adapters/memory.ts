import { SyncStorageAdapter } from "../types";

export default class MemoryAdapter implements SyncStorageAdapter {
    private memory: { [key: string]: object[] } = {};

    getCollections(): string[] {
        return Object.keys(this.memory);
    }
    load(collection: string): object[] {
        return this.memory[collection] || [];
    }
    removeCollection(collection: string): void {
        delete this.memory[collection];
    }
    save(collection: string, data: object[]): void {
        this.memory[collection] = data;
    }
}
