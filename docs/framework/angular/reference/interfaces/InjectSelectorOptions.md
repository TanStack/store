---
id: InjectSelectorOptions
title: InjectSelectorOptions
---

# Interface: InjectSelectorOptions\<TSelected\>

Defined in: [packages/angular-store/src/injectSelector.ts:11](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L11)

## Extends

- `Omit`\<`CreateSignalOptions`\<`TSelected`\>, `"equal"`\>

## Type Parameters

### TSelected

`TSelected`

## Properties

### compare()?

```ts
optional compare: (a, b) => boolean;
```

Defined in: [packages/angular-store/src/injectSelector.ts:15](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L15)

#### Parameters

##### a

`TSelected`

##### b

`TSelected`

#### Returns

`boolean`

***

### debugName?

```ts
optional debugName: string;
```

Defined in: node\_modules/.pnpm/@angular+core@21.2.11\_@angular+compiler@21.2.11\_rxjs@7.8.2\_zone.js@0.16.1/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:54

A debug name for the signal. Used in Angular DevTools to identify the signal.

#### Inherited from

```ts
Omit.debugName
```

***

### injector?

```ts
optional injector: Injector;
```

Defined in: [packages/angular-store/src/injectSelector.ts:16](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L16)
