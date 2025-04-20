export type Id = string;

export interface Context {
    [key: string]: any
}

export interface Data {
    [key: string]: any;
}

export interface Arg {
    _id?: Id,
    [key: string]: any
}

export type SearchFunc<T = any> = (data: T, context: Context) => boolean;
export type UpdaterFunc<T = any> = (data: T, context: Context) => boolean;

export type Search<T = any> = SearchOptions | SearchFunc<T>;
export type Updater<T = any> = UpdaterArg | UpdaterArg[] | UpdaterFunc<T>;

export interface DbFindOpts {
    reverse?: boolean;
    max?: number;
}

export interface FindOpts {
    select?: string[];
    exclude?: string[];
    transform?: Function;
}


/** Logical Operators */
export type LogicalOperators = {
    /**
     * Recursively applies multiple conditions, all of which must evaluate to true.
     * Can include other operators such as $gt, $exists, or nested $and/$or conditions.
     */
    $and?: Array<SearchOptions>;

    /**
     * Recursively applies multiple conditions, at least one of which must evaluate to true.
     * Can include other operators such as $lt, $type, or nested $and/$or conditions.
     */
    $or?: Array<SearchOptions>;

    /**
     * Negates a single condition.
     * Can include any other operator as its value.
     */
    $not?: SearchOptions;
};

/** Comparison Operators */
export type ComparisonOperators = {
    $gt?: Record<string, number>;
    $lt?: Record<string, number>;
    $gte?: Record<string, number>;
    $lte?: Record<string, number>;
    $in?: Record<string, any[]>;
    $nin?: Record<string, any[]>;
    $between?: Record<string, [number, number]>;
};

/** Type and Existence Operators */
export type TypeAndExistenceOperators = {
    $exists?: Record<string, boolean>;
    $type?: Record<string, string>;
};

/** Array Operators */
export type ArrayOperators = {
    $arrinc?: Record<string, any[]>;
    $arrincall?: Record<string, any[]>;
    $size?: Record<string, number>;
};

/** String Operators */
export type StringOperators = {
    $regex?: Record<string, RegExp>;
    $startsWith?: Record<string, string>;
    $endsWith?: Record<string, string>;
};

/** Other Operators */
export type OtherOperators = {
    $subset?: Record<string, any>;
};

/** Predefined Search Operators */
export type PredefinedSearchOperators = LogicalOperators &
    ComparisonOperators &
    TypeAndExistenceOperators &
    ArrayOperators &
    StringOperators &
    OtherOperators;

/**
 * SearchOptions can be either a function or an object with predefined operators.
 */
export type SearchOptions = PredefinedSearchOperators & Arg;

/**
 * Predefined type for updating data.
 */

/** Arrays */
export type ArrayUpdater = {
    $push?: any,
    /** Pushes items into an array and removes duplicates */
    $pushset?: any,
    $pull?: any,
    $pullall?: any,
}

/** Objects */
export type ObjectUpdater = {
    $merge?: any,
}

/** Values */
export type ValueUpdater = {
    $set?: any,
    $inc?: any,
    $dec?: any,
    $unset?: any,
    $rename?: any,
}


export type UpdaterArg =
    ArrayUpdater &
    ObjectUpdater &
    ValueUpdater &
    { [key: string]: any };

export interface SyncStorageAdapter {
    load(collection: string): object[];
    save(collection: string, data: object[]): void;
    getCollections(): string[];
    removeCollection(collection: string): void;
}

export interface AsyncStorageAdapter {
    load(collection: string): Promise<object[]>;
    save(collection: string, data: object[]): Promise<void>;
    getCollections(): Promise<string[]>;
    removeCollection(collection: string): Promise<void>;
}

export type Adapter = SyncStorageAdapter | AsyncStorageAdapter;