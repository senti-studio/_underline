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
_u.begin("#main") // main
_u.display(DisplayFlag.FlexRow)

_u.begin("#left-area") // main -> left-area
_u.display(DisplayFlag.FlexFixed)
_u.rect(25, "100%")
_u.fill("#ddd")
_u.end()

_u.begin("#content") // main -> fill center content
_u.display(DisplayFlag.FlexDynamic)
_u.rect("100%", "100%")
_u.fill("#fff000")
_u.end()

_u.begin("#right-area") // main -> right-area
_u.display(DisplayFlag.FlexFixed)
_u.rect(25, "100%")
_u.fill("#ddd")
_u.end()

_u.end()
_u.renderTo(this)
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
- [ ] Canvas, WebGL, Phaser Support
