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

![image](https://user-images.githubusercontent.com/26031740/184341099-f7dff5c5-f417-45e3-842f-1c42e18fef99.png)

![image](https://user-images.githubusercontent.com/26031740/184341142-63eb19be-cd9c-40d8-b8e4-88499c2c60a6.png)

I believe this is because [`typeLiteralConverter`](https://github.com/TypeStrong/typedoc/blob/e74eea694838f170e4e8becf3a701b9015e01c5d/src/lib/converter/types.ts#L525) does not check for constructor signatures (shown in the AST - see it [here](https://ts-ast-viewer.com/#code/CYUwxgNghgTiAEYD2A7AzgF3gZQJYoHMIQ8BbAB2IGEMkYAueAbwCh534UQB3eACiiNMMfAQA08AEZCMIwgEpGAQRgwoATwA8w0QD4A3CwC+LFqEiwEydFgCyAVwgZclErgrVaMNI1YdOPPyC8DqEEtIhsqKK8CpqWqEEBmwcXLwCMnLiUowo9qSSIDAxcRraUYQAPnkFRckmZuDQcIjQaGg4osRKwABuUChgIMA0dACSFJoAKrrMKezWwvZgXnz9EPYgjFMSAHT7ANYg6j7wAAowSORFGOoA0scA2gC68oYN+BhFAGZQQ52Ebp9AZDEZeaazEAADy+KGAHTwgJAPX6g2GoxgE3IELmDXMzSsqEwAKIyOBaLBdF88wCvGmEjO8GhsPh8CO6iQ33gMzWUA2W25e0Ox1OZxeMURpJRIPR4Jm70MjQsLQs7XgDicLiBqNBGLQWJxfg4i1ky1W6022yFu3Zosu1xgtwe6nF71Mnx+fwQGucrmlFL1OOZIDhHR9WrJOtldH1kxmuNM+MsiCJdkcvu1Msp3mp-jS8Hp5yZMJDrPZnO5ul5-Kt8H2NpFjDFr0Y4b95N1XjQEMMecCEOrlu5MTbmYDXZ7xkMQA) - as `ConstructSignature` nodes).

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

![image](https://user-images.githubusercontent.com/26031740/184341216-9cadccf5-527e-4c94-baa0-92534e50cab7.png)

This is likely because the symbol associated with the variable declaration is also associated with the interface declaration (see the associated AST [here](https://ts-ast-viewer.com/#code/CYUwxgNghgTiAEYD2A7AzgF3gZQJYoHMIQ8BbAB2IGEMkYAueAbwCh534UQB3eACiiNMMfAQA08AEZCMIwgEpGAQRgwoATwA8w0QD4A3CwC+LFqEiwEydFgCyAVwgZclErgrVaMNI1YdOPPyC8DqEEtIhsqKK8CpqWqEEBmwcXLwCMnLiUowo9qSSIDAxcRraUYQAPnkFRckmZuDQcIjQaGg4osRKwABuUChgIMA0dACSFJoAKrrMKezWwvZgXnz9EPYgjFMSAHT7ANYg6j7wAAowSORFGOoA0scA2gC68oYN+BhFAGZQQ52Ebp9AZDEZeaazEAADy+KGAHTwgJAPX6g2GoxgE3IELmDXMzSsqEwAKIyOBaLBdF88wCvGmEjO8GhsPh8CO6iQ33gMzWUA2W25e0Ox1OZxeMURpJRIPR4Jm70MjQsLQs7XgDicLiBqNBGLQWJxfg4i1ky1W6022yFu3Zosu1xgtwe6nF71Mnx+fwQGucrmlFL1OOZIDhHR9WrJOtldH1kxmuNM+MsiCJdkcvu1Msp3mp-jS8Hp5yZMJDrPZnO5ul5-Kt8H2NpFjDFr0Y4b95N1XjQEMMecCEOrlu5MTbmYDXZ7xkMQA)). When TypeDoc extracts the declaration from the symbol in [`convertVariable` function](https://github.com/TypeStrong/typedoc/blob/e74eea694838f170e4e8becf3a701b9015e01c5d/src/lib/converter/symbols.ts#L779), it happens to get the interface declaration, which is why the [`ts.isVariableDeclaration` check](https://github.com/TypeStrong/typedoc/blob/e74eea694838f170e4e8becf3a701b9015e01c5d/src/lib/converter/symbols.ts#L802) fails and we eventually end up using [`constructorConverter`](https://github.com/TypeStrong/typedoc/blob/e74eea694838f170e4e8becf3a701b9015e01c5d/src/lib/converter/types.ts#L203). 

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

![image](https://user-images.githubusercontent.com/26031740/184341286-c20999ad-9d92-4462-a25d-ce789fb4591c.png)

## Steps to reproduce the bug

1. Clone [the reproduction repository](https://github.com/ejuda/typedoc-variable-signatures-repro).
2. `npm ci`
3. `npm run docs`
4. This will generate documentation into `docs` directory.

## Environment

-   Typedoc version: 0.23.10
-   TypeScript version: 4.7.4
-   Node.js version: 16.15.0
-   OS: Windows 10
