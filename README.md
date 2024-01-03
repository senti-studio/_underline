<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/media/underline_header_dark.png">
  <source media="(prefers-color-scheme: light)" srcset="/media/underline_header_light.png">
  <img alt="_underline header" src="/media/underline_header_light.png">
</picture>

> Currently only for PixiJs - inspired by DearImGui and CSS.

> [!CAUTION]
> Heavy work in progress, not recommended for production yet!

<br />

## Install

```
npm install @tinytales/_underline
```

<br />

## Example

```typescript
_.Begin("#main", this) // main
_.Display(DisplayFlag.FlexRow)

__.Begin("#left-area") // main -> left-area
__.Display(DisplayFlag.FlexFixed)
__.Rect(25, "100%")
__.Fill("#ddd")
__.End()

__.Begin("#content") // main -> fill center content
__.Display(DisplayFlag.FlexDynamic)
__.Rect("100%", "100%")
__.Fill("#fff000")
__.End()

__.Begin("#right-area") // main -> right-area
__.Display(DisplayFlag.FlexFixed)
__.Rect(25, "100%")
__.Fill("#ddd")
__.End()

_.End()
```

Soon i will add more examples into the **_/example_** folder.

<br />

## Roadmap

- [ ] Key / Mouse Events
- [ ] Text / Images
- [ ] Examples & Unittests
- [ ] More shapes (currently only rect)
- [ ] More useful CSS options
- [ ] Tables & Lists
- [ ] Scrollables
- [ ] Reusables & Repeatables
- [ ] Hover, Click States
- [ ] Global Settings (Reusables, Styles, States)
- [ ] WebGl, Phaser Support
