# Inconsistent treatment of variable signatures containing constructors

## Search terms

variable, signature, constructor, type literal

## Expected Behavior

Consider the following code:

```ts
// index.d.ts

declare const SingleSimpleCtor: {
    new (a: string, b: string): Array<string>;
}

declare const MultipleSimpleCtors: {
    new (a: string, b: string): Array<string>;
    new (a: string, b: number): Array<string|number>;
}
```

I would expect TypeDoc to document the constructor signatures contained in the variable declaration.

## Actual Behavior

TypeDoc does not document these constructor signatures:



I believe this is because [`typeLiteralConverter`](https://github.com/TypeStrong/typedoc/blob/master/src/lib/converter/types.ts#L525) does not check for constructor signatures.

Oddly enough, sometimes the constructors are documented correctly. Consider the following code:

```ts
// index.d.ts

declare class SingleAdvancedCtorImp<T> {
    constructor(value: T, ...keys: PropertyKey[]);
}

interface SingleAdvancedCtor<T> extends SingleAdvancedCtorImp<T> {
}

declare const SingleAdvancedCtor: {
    new <T, P extends keyof T>(value: T, ...keys: P[]): SingleAdvancedCtor<T>;
};
```

for which TypeDoc renders the following:



This is likely because the symbol associated with the variable declaration is also associated with the interface declaration. When TypeDoc extracts the declaration from the symbol in [`convertVariable` function](https://github.com/TypeStrong/typedoc/blob/e74eea694838f170e4e8becf3a701b9015e01c5d/src/lib/converter/symbols.ts#L779), it happens to get the interface declaration, which is why the [`ts.isVariableDeclaration` check](https://github.com/TypeStrong/typedoc/blob/e74eea694838f170e4e8becf3a701b9015e01c5d/src/lib/converter/symbols.ts#L802) fails and we eventually end up using [`constructorConverter`](https://github.com/TypeStrong/typedoc/blob/master/src/lib/converter/types.ts#L525).

As soon as we add a second constructure signature:

```ts
// index.d.ts

declare class MultipleAdvancedCtorsImp<T> {
    constructor(value: T, ...keys: PropertyKey[]);
}

interface MultipleAdvancedCtors<T> extends MultipleAdvancedCtorsImp<T> {
}

declare const MultipleAdvancedCtors: {
    new <T, P extends keyof T>(value: T, ...keys: P[]): MultipleAdvancedCtors<T>;
    new <T>(value: T): MultipleAdvancedCtors<T>;
};
```

we revert back to the `typeLiteralConverter` and the constructor signatures are not rendered:



## Steps to reproduce the bug

1. Clone [the reproduction
   repository](https://github.com/ejuda/typedoc-variable-signatures-repro).
2. `npm ci`
3. `npm run docs`
4. This will generate documentation into `docs` directory.

## Environment

-   Typedoc version: 0.23.10
-   TypeScript version: 4.7.4
-   Node.js version: 16.15.0
-   OS: Windows 10
