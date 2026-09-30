---
id: InjectSelectorOptions
title: InjectSelectorOptions
---

Defined in: [packages/angular-store/src/injectSelector.ts:13](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L13)

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

Defined in: [packages/angular-store/src/injectSelector.ts:17](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L17)

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

Defined in: node\_modules/.pnpm/@angular+core@22.0.7\_@angular+compiler@22.0.7\_rxjs@7.8.2\_zone.js@0.16.1/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:54

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

Defined in: [packages/angular-store/src/injectSelector.ts:18](https://github.com/TanStack/store/blob/main/packages/angular-store/src/injectSelector.ts#L18)
