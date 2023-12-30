## TinyGui

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/media/underline_header_dark.png">
  <source media="(prefers-color-scheme: light)" srcset="/media/underline_header_light.png">
  <img alt="_underline header" src="/media/underline_header_light.png">
</picture>

> Tiny Gui for PixiJs inspired by DearImGui and CSS
> 
> Heavy work in progress, not recommended for production yet.


## Install

```
npm install @tinytales/_underline
```

## Example

```typescript
_.Begin(this) // main
_.Display(TinyGui.DisplayFlag.FlexRow)

__.Begin() // main -> left-area
__.Display(TinyGui.DisplayFlag.FlexFixed)
__.Rect(25, '100%')
__.Fill('#ddd')
__.End()

__.Begin() // main -> fill center content
__.Display(TinyGui.DisplayFlag.FlexDynamic)
__.Rect('100%', '100%')
__.Fill('#fff000')
__.End()

__.Begin() // main -> right-area
__.Display(TinyGui.DisplayFlag.FlexFixed)
__.Rect(25, '100%')
__.Fill('#ddd')
__.End()

_.End()
```

Soon i will add more examples into the **_/example_** folder.

## Todo

- [ ] Key / Mouse Events (v0.3)
- [ ] Text / Images (v0.4)
- [ ] Examples & Unittests (v0.5)
- [ ] More shapes (currently only rect) (v0.5)
- [ ] More useful CSS options (v0.6)
- [ ] Tables & Lists (v0.7)
- [ ] Scrollables (v0.8)
