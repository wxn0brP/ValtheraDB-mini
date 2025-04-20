import { SyncStorageAdapter } from "../types";
import fs from "fs";

export default class FileAdapter implements SyncStorageAdapter {
    constructor(private dir: string) {
        if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);
    }

    getCollections(): string[] {
        return fs.readdirSync(this.dir).filter(f => f.endsWith(".db"));
    }
    load(collection: string): object[] {
        return JSON.parse(fs.readFileSync(`${this.dir}/${collection}.db`, "utf-8"));
    }
    removeCollection(collection: string): void {
        if (!fs.existsSync(`${this.dir}/${collection}.db`)) return;
        return fs.unlinkSync(`${this.dir}/${collection}.db`);
    }
    save(collection: string, data: object[]): void {
        fs.writeFileSync(`${this.dir}/${collection}.db`, JSON.stringify(data));
    }
}