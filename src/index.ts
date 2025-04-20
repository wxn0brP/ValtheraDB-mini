import executorC from "./executor";
import { Arg, AsyncStorageAdapter, Context, Data, DbFindOpts, FindOpts, Search, SyncStorageAdapter, Updater } from "./types";
import updateFindObject from "./utils/updateFindObject";
import { genId, hasFields, updateObject } from './aliases';

type AsyncOrSync<A extends boolean, T> = A extends true ? Promise<T> : T;

function isF(f: Arg): boolean {
    return f instanceof Function
} 

function searchFn(data: Data, search: Search, context?: Context): boolean {
    // @ts-ignore
    return isF(search) ? search(data, context || {}) : hasFields(data, search || {});
}

function updateFn(data: Data, updater: Updater, context?: Context): any {
    // @ts-ignore
    return isF(updater) ? updater(data, context || {}) : updateObject(data, updater);
}

export class ValtheraDBMini<A extends boolean> {
    exe: executorC;

    constructor (
        private adapter: A extends true ? AsyncStorageAdapter : SyncStorageAdapter,
        private async: A
    ) {
        if (async) this.exe = new executorC();
    }

    getCollections(): AsyncOrSync<A, string[]> {
        if (this.async) {
            return this.exe.addOp(this.adapter.getCollections) as any;
        } else {
            return this.adapter.getCollections() as any;
        }
    }

    load(collection: string, then: Function) {
        if (this.async) {
            return this.exe.addOp(this.adapter.load, collection).then(then as any);
        } else {
            return then(this.adapter.load(collection)) as any;
        }
    }

    save(collection: string, data: Data[], r?) {
        if (this.async) {
            return this.exe.addOp(this.adapter.save, collection, data);
        } else {
            this.adapter.save(collection, data);
            return r || true;
        }
    }

    /**
     * Check if a collection exists.
     */
    issetCollection(collection: string): AsyncOrSync<A, boolean> {
        if (this.async) {
            return (this.adapter.getCollections() as any).then(collections => collections.includes(collection)) as any;
        } else {
            return (this.adapter.getCollections() as any).includes(collection) as any;
        }
    }
    /**
     * Add data to a database.
     */
    add<T = Data>(collection: string, data: Arg, id_gen?: boolean): AsyncOrSync<A, T> {
        if (id_gen && !data._id) data._id = genId();
        // if (this.async) {
        //     return this.executor.addOp(async () => {
        //         const res = await this.adapter.load(collection);
        //         await this.adapter.save(collection, [...res, data]);
        //         return data as any;
        //     }) as any;
        // } else {
        //     const res = this.adapter.load(collection) as any;
        //     this.adapter.save(collection, [...res, data]);
        //     return data as any;
        // }
        return this.load(collection, (d) => {
            d.push(data);
            return this.save(collection, d, data);
        })
    }
    /**
     * Find data in a database.
     */
    find<T = Data>(collection: string, search: Search, context?: Context, options?: DbFindOpts, findOpts?: FindOpts): AsyncOrSync<A, T[]> {
        const find = (data) => {
            if (options?.reverse) data = data.reverse();
            data = data.filter((d) => searchFn(d, search || {}, context || {}));
            data = data.map(d => updateFindObject(d, findOpts || {}));
            if (options?.max) data = data.slice(0, options.max);
            return data;
        } 
        return this.load(collection, find);
    }
    /**
     * Find one data entry in a database.
     */
    findOne<T = Data>(collection: string, search: Search, context?: Context, findOpts?: FindOpts): AsyncOrSync<A, T> {
        const find = (data) => {
            const res = data.find(d => searchFn(d, search || {}, context || {}));
            if (!res) return null;
            return updateFindObject(res, findOpts || {});
        }
        return this.load(collection, find);
    }

    _update(one: boolean, collection: string, search: Search, updater: Updater, context?: {}): AsyncOrSync<A, boolean> {
        const update = (data) => {
            data = data.filter(d => searchFn(d, search || {}, context || {}));

            let updated = false;
            const res = data.map(d => {
                if (one && updated) return d;
                updated = true;
                return updateFn(d, updater || {}, context || {})
            });
            
            // if (this.async) {
            //     return (this.adapter.save(collection, res) as any).then(() => true) as any;
            // } else {
            //     this.adapter.save(collection, res);
            //     return true;
            // }
            return this.save(collection, res);
        }
        return this.load(collection, update);
    }

    /**
     * Find data in a database as a stream.
     */
    update(collection: string, search: Search, updater: Updater, context?: {}): AsyncOrSync<A, boolean> {
        return this._update(false, collection, search, updater, context);
    }
    /**
     * Update one data entry in a database.
     */
    updateOne(collection: string, search: Search, updater: Updater, context?: Context): AsyncOrSync<A, boolean> {
        return this._update(true, collection, search, updater, context);
    }

    _remove(one: boolean, collection: string, search: Search, context?: Context): AsyncOrSync<A, boolean> {
        const remove = (data) => {
            let removed = false;
            data = data.filter(d => {
                const res = searchFn(d, search || {}, context || {});
                if (one && removed) return true;
                if (res) removed = true;
                return res;
            });
            // if (this.async) {
            //     return (this.adapter.save(collection, data) as any).then(() => true) as any;
            // } else {
            //     this.adapter.save(collection, data);
            //     return true;
            // }
            return this.save(collection, data);
        }
        return this.load(collection, remove);
    }
    /**
     * Remove data from a database.
     */
    remove(collection: string, search: Search, context?: Context): AsyncOrSync<A, boolean>{
        return this._remove(false, collection, search, context);
    }
    /**
     * Remove one data entry from a database.
     */
    removeOne(collection: string, search: Search, context?: Context): AsyncOrSync<A, boolean>{
        return this._remove(true, collection, search, context);
    }

    /**
     * Asynchronously updates one entry in a database or adds a new one if it doesn't exist.
     */
    updateOneOrAdd(collection: string, search: Search, updater: Updater, add_arg?: Arg, context?: Context, id_gen?: boolean): AsyncOrSync<A, boolean>{
        const update = (data) => {
            const res = data.find(d => searchFn(d, search || {}, context || {}));
            if (res) {
                updateFn(res, updater || {}, context || {});
                if (this.async) {
                    return (this.adapter.save(collection, data) as any).then(() => true) as any;
                } else {
                    this.adapter.save(collection, data);
                    return true;
                }
            } else {
                const assignData = [];
                function assignDataPush(data: any) {
                    if (typeof data !== "object" || Array.isArray(data)) return;
                    const obj = {};
                    for (const key of Object.keys(data)) {
                        if (key.startsWith("$")) {
                            Object.keys(data[key]).forEach((k) => {
                                obj[k] = data[key][k];
                            })
                        } else
                        obj[key] = data[key];
                    }
                    assignData.push(obj);
                }
                
                assignDataPush(search);
                assignDataPush(updater);
                assignDataPush(add_arg);
                const newData = Object.assign({}, ...assignData);
                if (this.async) {
                    return this.add(collection, newData, id_gen).then(() => true) as any;
                } else {
                    this.add(collection, newData, id_gen);
                    return true;
                }
            }
        }
        return this.load(collection, update);
    }
    /**
     * Removes a database collection from the file system.
     */
    removeCollection(collection: string): AsyncOrSync<A, void> {
        return this.adapter.removeCollection(collection) as any;
    }
}