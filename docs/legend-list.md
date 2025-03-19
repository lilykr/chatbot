---
title: Usage
description: Legend List Usage
sidebar:
    order: 2
---

Legend List is a virtualized ScrollView component for React Native with optional recycling, that can massively increase performance of rendering long lists. Rather than rendering every item in the list, it only renders the items that are in view, which significantly reduces the amount of items that need to render.

Legend List is a drop-in replacement for FlatList or FlashList. So since you're likely coming from one of those, we'll start with a guide on how to switch.

### Switch from FlashList

If you're coming from FlashList, in most cases you can just rename the component and it will work as expected. But note that Legend List does not recycle items by default, so to match FlashList's behavior you can enable `recycleItems`.

```diff
return (
-  <FlashList
+  <LegendList
      data={items}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      estimatedItemSize={320}
+      recycleItems
  />
)
```

### Switch from FlatList

If you're coming from FlatList, you'll just want to add at least one prop, the `estimatedItemSize`. Legend List automatically lays out your items in a very high performance way, and a hint for what size the items are likely to be will help it be as fast as possible.

```diff
return (
-  <FlatList
+  <LegendList
      data={items}
      renderItem={({ item }) => <Text>{item.title}</Text>}
+      estimatedItemSize={320}
  />
)
```

If you first render a LegendList without an `estimatedItemSize` it will suggest an optimal item size based on the rendered items, so that can help you find the right number.

## Guide

Legend List is very optimized by default, so it may already be working well without any configuration. But these are some common ways to improve your list behavior.

### Estimate item sizes

```ts
estimatedItemSize?: number;
getEstimatedItemSize?: (index: number, item: T) => number;
onItemSizeChanged?: (info: {
        size: number;
        previous: number;
        index: number;
        itemKey: string;
        itemData: ItemT;
    }) => void;
```

It's important to provide an `estimatedItemSize` (if items are the same size or all dynamic sizes) or `getEstimatedItemSize` (if items are different known sizes). Legend List uses this as the default item size, then as items are rendered it updates their positions with the actual size. So getting this estimate as close as possible to the real size will reduce layout shifting and blank spaces as items render. If not provided it will use `100px` as the default.

The `onItemSizeChanged` event can also help with your estimations - it will be called whenever an item's size changes. So you can use it to log what the actual rendered size is to adjust your estimates.

### Use keyExtractor

```ts
keyExtractor?: (item: T, index: number) => string;
```

The `keyExtractor` prop lets Legend List save item layouts by key, so that if the `data` array changes it can reuse previous layout information and only update the changed items. Without `keyExtractor`, item sizes will reset to their default whenever `data` changes. So it is very recommended to have a `keyExtractor` if `data` ever changes. If your items are a fixed size, providing a `keyExtractor` that returns the index will tell it to reuse size information.

### Set a drawDistance

```ts
drawDistance?: number
```

The `drawDistance` (defaults to `250`) is the buffer size in pixels above and below the viewport that will be rendered in advance. So for example if your screen is `2000px` tall and your draw distance is `1000`, then it will render double your screen size, from `-1000px` above the viewport to `1000px` below the viewport.

This can help reduce the amount of blank space while scrolling quickly. But if your items are computationally expensive, it may reduce performance because more items are rendering at once. So you should experiment with it to find the most optimal behavior for your app.

### waitForInitialLayout

```ts
waitForInitialLayout?: boolean
```

If the size of your list items differs significantly from the estimate, you may see a layout jump after the first render. If so, the `waitForInitialLayout` prop solves that by delaying displaying list items by one frame so they start at the correct position.

### Recycling items

```ts
recycleItems?: boolean
```

Legend List has an optional `recycleItems` prop which enables view recycling. This will reuse the component rendered by your `renderItem` function. This can be a big performance optimization because it does not need to destroy/create views while scrolling. But it also reuses any local state, which can cause some weird behavior that may not be desirable depending on your app. But see the next section for [recycling hooks](#recycling-hooks) to make that easier.

So there are some tradeoffs with recycling:

- 👍 If you have items with no state then recycling should be great
- 👎 If you have simple items with complex state then it may be more trouble than it's worth
- 👍 If you have heavy items with complex state then working around the state recycling may be worth it for the performance gains

#### Recycling hooks

```ts
useRecyclingEffect: (effect: (info: LegendListRecyclingState) => void | (() => void)) => void;
useRecyclingState: <T>(updateState: ((info: LegendListRecyclingState) => T) | T) => [T, Dispatch<T>];
```

`renderItem` receives two hooks to help you manage the recycling.

1. `useRecyclingState` automatically resets the state when it recycles into a new item
2. `useRecyclingEffect` can be used to reset any side effects when an item gets recycled.

```tsx
export function ItemComponent({ item, useRecyclingEffect, useRecyclingState }) {

    // Like useState but it resets when the item is recycled
    const [isExpanded, setIsExpanded] = useRecyclingState(() => false);

    // A callback when the item is recycled into a new item
    useRecyclingEffect?.(({ item, prevItem, index, prevIndex }) => {
        // Reset any side effects from the previous item
        refSwipeable?.current?.close();
        refVideo?.current?.reset();
    });

    // ...
}
```

### Maintain Visible Content Position

```ts
maintainVisibleContentPosition?: boolean;
```

The `maintainVisibleContentPosition` prop automatically adjusts item positions when items are added/removed/resized above the viewport so that there is no shift in the visible content. This is very helpful for some scenarios, but if you have a static list of fixed sized items you probably don't need it.

- If items get added/removed/resized above the viewport, items will not move on screen
- When using `initialScrollOffset` or `initialScrollIndex`, items will not jump around when scrolling up if they're different sizes than the estimate
- When scrolling to an index far down the list and then back up, items will not jump around as they layout

LegendList utilizes ScrollView's [maintainVisibleContentPosition](https://reactnative.dev/docs/scrollview#maintainvisiblecontentposition) prop internally, so your target react-native version should support that prop. To use maintainVisibleContentPosition on Android you will need at least React Native version [0.72](https://github.com/facebook/react-native/commit/c19548728c9be3ecc91e6fefb35bc14929109d60).

### Chat interfaces without inverse

```ts
alignItemsAtEnd?: boolean;
maintainScrollAtEnd?: boolean;
maintainScrollAtEndThreshold?: number;
```

In other list libraries if you wanted items to start scrolling from the bottom, you'd need to use an `inverted` prop, which would apply a negative scale transform. But that causes a lot of weird issues, so Legend List explicitly does not do that.

Instead, to align items at the end you can just use the `alignItemsAtEnd` prop, which will apply padding above items to fill the screen and stick them to the bottom.

The `maintainScrollAtEnd` prop will check if you are already scrolled to the bottom when `data` changes, and if so it keeps you scrolled to the bottom.

The `maintainScrollAtEndThreshold` prop (which defaults to 0.1) defines what percent of the screen counts as the bottom.

So using Legend List for a chat interface would look like this:

```tsx
  <LegendList
    data={items}
    renderItem={({ item }) => <Text>{item.title}</Text>}
    estimatedItemSize={320}
    alignItemsAtEnd
    maintainScrollAtEnd
    maintainScrollAtEndThreshold={0.1}
  />
```

### Two-way infinite scrolling

```ts
onStartReached?: ((info: { distanceFromStart: number }) => void) | null | undefined;
onEndReached?: ((info: { distanceFromEnd: number }) => void) | null | undefined;
```

These callbacks fire when you scroll to the top or bottom of a list. This can be used to load more data in either direction. In a typical list you'll likely just use `onEndReached` to load more data when the users scrolls to the bottom.

If you have a chat-like interface you may want to load more messages as you scroll up, and you can use `onStartReached` for that. If you are doing that, you will very likely want to use [maintainVisibleContentPosition](#maintain-visible-content-position) so that the items loading above don't shift the viewport down.

## Props

### alignItemsAtEnd

```ts
alignItemsAtEnd?: boolean;
```

Aligns to the end of the screen, so if there's only a few items there will be enough padding at the top to make them appear to be at the bottom. See [Chat interfaces without inverse](#chat-interfaces-without-inverse) for more.

### data

```ts
data: ItemT[];
```

An array of the items to render. This can also be an array of keys if you want to get the item by key in [renderItem](#renderitem).

### drawDistance

```ts
drawDistance?: number;
```

The `drawDistance` (defaults to `250`) is the buffer size in pixels above and below the viewport that will be rendered in advance. See [drawDistance](#set-a-drawdistance) for more.

### estimatedItemSize

```ts
estimatedItemSize?: number;
```

An estimated size for all items which is used to estimate the list layout before items actually render. If you don't provide this, it will log a suggested value for optimal performance.

### getEstimatedItemSize

```ts
getEstimatedItemSize?: (index: number, item: ItemT) => number;
```

An estimated size for each item which is used to estimate the list layout before items actually render. If you don't provide this, it will log a suggested value for optimal performance.

### initialScrollIndex

```ts
initialScrollIndex?: number;
```

Start scrolled with this item at the top. By default, to have accurate scrolling position you will need to provide accurate element positions to the [getEstimatedItemSize](#getestimateditemsize) function(similar FlatList). When accurate positions are not known (e.g., for dynamically sized list items), please enable [maintainVisibleContentPosition](#maintain-visible-content-position) prop. This will allow LegendList to automatically adjust its top boundary when elements below initialScrollIndex will be measured.

### initialScrollOffset

```ts
initialScrollOffset?: number;
```

Start scrolled to this offset.

### ItemSeparatorComponent

```ts
ItemSeparatorComponent?: React.ComponentType<any>;
```

Rendered in between each item, but not at the top or bottom.

See [React Native Docs](https://reactnative.dev/docs/flatlist#itemseparatorcomponent).

### keyExtractor

```ts
keyExtractor?: (item: ItemT, index: number) => string;
```

Highly recommended. The `keyExtractor` prop lets Legend List save item layouts by key, so that if the `data` array changes it can reuse previous layout information and only update the changed items. See [Use key extractor](#use-keyextractor)

### ListEmptyComponent

```ts
ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
```
Rendered when the list is empty.

See [React Native Docs](https://reactnative.dev/docs/flatlist#listemptycomponent).

### ListEmptyComponentStyle

```ts
ListEmptyComponentStyle?: StyleProp<ViewStyle> | undefined;
```
Styling for internal View for `ListEmptyComponent`.


### ListFooterComponent

```ts
ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
```
Rendered at the bottom of all the items.

See [React Native Docs](https://reactnative.dev/docs/flatlist#listfootercomponent).


### ListFooterComponentStyle

```ts
ListFooterComponentStyle?: StyleProp<ViewStyle> | undefined;
```
Styling for internal View for `ListFooterComponent`.

See [React Native Docs](https://reactnative.dev/docs/flatlist#listfootercomponentstyle).

### ListHeaderComponent

```ts
ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
```
Rendered at the top of all the items.

See [React Native Docs](https://reactnative.dev/docs/flatlist#listheadercomponent).

### ListHeaderComponentStyle

```ts
Styling for internal View for `ListHeaderComponent`.

See [React Native Docs](https://reactnative.dev/docs/flatlist#listheadercomponentstyle).


### maintainScrollAtEnd

```ts
maintainScrollAtEnd?: boolean;
```

This will check if you are already scrolled to the bottom when `data` changes, and if so it keeps you scrolled to the bottom.

See [Chat interfaces without inverse](#chat-interfaces-without-inverse) for more.

### maintainScrollAtEndThreshold

```ts
maintainScrollAtEndThreshold?: number;
```

This defines what percent of the screen counts as the bottom. Defaults to `0.1`.

See [Chat interfaces without inverse](#chat-interfaces-without-inverse) for more.

### maintainVisibleContentPosition

```ts
maintainVisibleContentPosition?: boolean;
```

Automatically adjust item positions when items are added/removed/resized above the viewport so that there is no shift in the visible content.

See [Maintain Visible Content Position](#maintain-visible-content-position) for more.


### numColumns

```ts
numColumns?: number;
```

Multiple columns will zig-zag like a flexWrap layout. Rows will take the maximum height of their columns, so items should all be the same height - masonry layouts are not supported.


### onEndReached

```ts
onEndReached?: ((info: { distanceFromEnd: number }) => void) | null | undefined;
```

A callback that's called only once when scroll is within `onEndReachedThreshold` of the bottom of the list. It resets when scroll goes above the threshold and then will be called again when scrolling back into the threshold.

### onEndReachedThreshold

```ts
onEndReachedThreshold?: number | null | undefined;
```

The distance from the end as a percentage that the scroll should be from the end to trigger `onEndReached`. It is multiplied by screen size, so a value of 0.5 will trigger `onEndReached` when scrolling to half a screen from the end.

### onStartReached

```ts
onStartReached?: ((info: { distanceFromStart: number }) => void) | null | undefined;
```

A callback that's called only once when scroll is within `onStartReachedThreshold` of the top of the list. It resets when scroll goes below the threshold and then will be called again when scrolling back into the threshold.

### onStartReachedThreshold

```ts
onStartReachedThreshold?: number | null | undefined;
```

The distance from the start as a percentage that the scroll should be from the end to trigger `onStartReached`. It is multiplied by screen size, so a value of 0.5 will trigger `onStartReached` when scrolling to half a screen from the start.

### onViewableItemsChanged

```ts
onViewableItemsChanged?: OnViewableItemsChanged | undefined;
```

Called when the viewability of rows changes, as defined by the `viewabilityConfig` prop.

See [React Native Docs](https://reactnative.dev/docs/flatlist#onviewableitemschanged).


### recycleItems

```ts
recycleItems?: boolean;
```

### renderItem

```ts
renderItem?: (props: LegendListRenderItemProps<ItemT>) => ReactNode;
```

### viewabilityConfig

```ts
viewabilityConfig?: ViewabilityConfig;
```

Configuration for when to update the `onViewableItemsChanged` callback.

See [React Native Docs](https://reactnative.dev/docs/flatlist#viewabilityconfig).

### viewabilityConfigCallbackPairs

```ts
viewabilityConfigCallbackPairs?: ViewabilityConfigCallbackPairs | undefined;
```

List of `ViewabilityConfig`/`onViewableItemsChanged` pairs. A specific `onViewableItemsChanged` will be called when its corresponding `ViewabilityConfig`'s conditions are met.

See [React Native Docs](https://reactnative.dev/docs/flatlist#viewabilityconfigcallbackpairs).

### onItemSizeChanged

```ts
onItemSizeChanged?: (info: {
        size: number;
        previous: number;
        index: number;
        itemKey: string;
        itemData: ItemT;
    }) => void;
```

Called whenever an item's rendered size changes. This can be used to adjust the estimatedItemSize to match the actual size, which can improve performance or reduce layout shifting.

## Methods

### scrollToIndex

```
scrollToIndex: (params: {
  index: number;
  animated?: boolean;
});
```

Scrolls to the item at the specified index. By default ([maintainVisibleContentPosition](#maintainvisiblecontentposition) is false), accurate scroll is guaranteed only if all accurate sizes of elements are provided to [getEstimatedItemSize](#getestimateditemsize) function(similar FlatList).

If estimated item sizes are not known, [maintainVisibleContentPosition](#maintainvisiblecontentposition) prop need to be set to true. In this mode, list would automatically select element you are scrolling to as anchor element and guarantee accurate scroll.

### scrollToOffset

```ts
scrollToOffset(params: {
  offset: number;
  animated?: boolean;
});
```

Scroll to a specific content pixel offset in the list.

Valid parameters:

- *offset* (number) - The offset to scroll to. In case of horizontal being true, the offset is the x-value, in any other case the offset is the y-value. Required.
- *animated* (boolean) - Whether the list should do an animation while scrolling. Defaults to true.

### scrollToItem

```ts
scrollToItem(params: {
  animated?: ?boolean,
  item: Item,
});
```

Requires linear scan through data - use [scrollToIndex](#scrolltoindex) instead if possible. Provided for compatibility with FlatList only.

Valid parameters:

- *animated* (boolean) - Whether the list should do an animation while scrolling. Defaults to true.
- *item* (object) - The item to scroll to. Required.

### scrollToEnd

```ts
scrollToEnd(params?: {
  animated?: boolean,
});
```

Scrolls to the end of the list.

Valid parameters:

- *animated* (boolean) - Whether the list should do an animation while scrolling. Defaults to true.
