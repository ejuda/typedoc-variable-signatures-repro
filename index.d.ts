declare const SingleSimpleCtor: {
    new (a: string, b: string): Array<string>;
}

declare const MultipleSimpleCtors: {
    new (a: string, b: string): Array<string>;
    new (a: string, b: number): Array<string|number>;
}

declare class SingleAdvancedCtorImp<T> {
    constructor(value: T, ...keys: PropertyKey[]);
}

interface SingleAdvancedCtor<T> extends SingleAdvancedCtorImp<T> {
}

declare const SingleAdvancedCtor: {
    new <T, P extends keyof T>(value: T, ...keys: P[]): SingleAdvancedCtor<T>;
};

declare class MultipleAdvancedCtorsImp<T> {
    constructor(value: T, ...keys: PropertyKey[]);
}

interface MultipleAdvancedCtors<T> extends MultipleAdvancedCtorsImp<T> {
}

declare const MultipleAdvancedCtors: {
    new <T, P extends keyof T>(value: T, ...keys: P[]): MultipleAdvancedCtors<T>;
    new <T>(value: T): MultipleAdvancedCtors<T>;
};
