import { evaluateDimensions, evaluatePosition } from './expressions'
import { Dimensions, DisplayFlag, Position, RenderReference } from './types'
import { Style, _underlineStyle, getStyle } from './_uStyle'
import { _uGlobal } from './_uGlobal'
import { Text, TextMetrics, TextStyle } from 'pixi.js'
import { Container, ContainerStack, ReferenceStack } from './stacks'

export function resolve(stack: ContainerStack, parent: RenderReference): ReferenceStack {
  const ref = new Map()

  // Resolve flex containers first
  stack.forEach((c: Container) => {
    if (c.flex.includes(DisplayFlag.FlexCol) || c.flex.includes(DisplayFlag.FlexRow)) {
      resolveFlex(parent, c, c.children)
    }
  })

  // Then resolve all containers
  stack.forEach((c: Container) => {
    const cRes = resolveContainer(c, ref.get(c.parent) ?? parent)
    ref.set(cRes.name, cRes)
  })
  return ref
}

function resolveContainer(container: Container, parent: RenderReference | Container): RenderReference {
  // Resolve expressions
  let d = resolveDimensions(container, parent.dimensions as Dimensions<number>)
  let p = resolvePositions(container, d, parent.position as Position<number>, parent.dimensions as Dimensions<number>)

  // We make sure that the container doesnt go out of bounds
  // Can happen when position is not 0 and dimensions are set to 100%
  const parentWidth = parent.dimensions!.w as number
  const parentHeight = parent.dimensions!.h as number
  if (container.position != null && typeof container.position.x === 'number') {
    // Check the initial x position + resolved width
    if (container.position.x + d.w > parentWidth) {
      d.w = parentWidth - container.position.x
    }
  }
  if (container.position != null && typeof container.position.y === 'number') {
    // Check the initial y position + resolved height
    if (container.position.y + d.h > parentHeight) {
      d.h = parentHeight - container.position.y
    }
  }

  // Resolve paddings
  if (parent.padding != null && container.display !== DisplayFlag.Absolute) {
    p.x += parent.padding.l
    if (p.x + d.w >= parentWidth - parent.padding.r) {
      d.w = parentWidth - parent.padding.r - parent.padding.l
      // If the container has a fixed position value for x
      // We need to subtract it too
      if (container.position != null && typeof container.position.x === 'number') {
        d.w -= container.position.x
      }
    }

    p.y += parent.padding.t
    if (p.y + d.h >= parentHeight - parent.padding.b) {
      d.h = parentHeight - parent.padding.b - parent.padding.t
      // If the container has a fixed position value for y
      // We need to subtract it too
      if (container.position != null && typeof container.position.y === 'number') {
        d.h -= container.position.y
      }
    }
  }

  let tRef = null
  let tStyle = null
  if (container.text != null) {
    // Get given style or default fallback
    const uStyle = getStyle(container.textStyle ?? '_default')
    tStyle = resolveTextStyle(uStyle)
    tRef = resolveText(container, d, p, tStyle, uStyle)
    // If the stack doesnt have dimensions, it scales of of the text dimensions
    // in which case we can just pass them on (even if its display absolute)
    if (container.dimensions == null) {
      d = { w: tRef.dimensions.w, h: tRef.dimensions.h }
      // Reevaluate the position (which needs the dimensions)
      if (typeof container.position!.x === 'string') {
        p = resolvePositions(container, d, parent.position as Position<number>, parent.dimensions as Dimensions<number>)
      }
      tRef = resolveText(container, d, p, tStyle, uStyle)
    }
  }

  return {
    name: container.name,
    container: container.container,
    display: container.display,
    dimensions: d,
    position: p,
    fill: container.fill,
    border: container.border,
    padding: container.padding,
    text: tRef ? tRef.text : null,
    textStyle: tStyle,
  }
}

function resolveDimensions(container: Container, parent: Dimensions<number>): Dimensions<number> {
  let dRef = <Dimensions<number>>{}

  switch (true) {
    /**
     * Display Absolute - No dimensions specified
     *
     * Gets 0,0 dimensions as default.
     */
    case container.display === DisplayFlag.Absolute && container.dimensions == null:
      // Otherwise print a warning that no dimensions are set
      if (container.text == null) {
        console.warn(`Current stack is absolute but has no dimensions: ${container.name} will not display`)
      }
      dRef = { w: 0, h: 0 }
      break
    /**
     * Display Inherit - No dimensions specified
     *
     * Inherits dimensions from parent
     */
    case container.display === DisplayFlag.Inherit && container.dimensions == null:
      dRef.w = parent.w
      dRef.h = parent.h
      break
    /**
     * Display Absolute - Dimensions specified
     *
     * Expression get evaluated based on window dimensions.
     */
    case container.display === DisplayFlag.Absolute && container.dimensions != null:
      if (_uGlobal.resolution == null) {
        throw new Error(`Game resolution not set (Use _uGlobal.resolution)`)
      }
      const wd = <Dimensions<number>>{
        w: _uGlobal.resolution.w,
        h: _uGlobal.resolution.h,
      }
      dRef = evaluateDimensions(container.dimensions!, wd)
      break
    /**
     * Display Inherit - Dimensions specified
     *
     * Expressions get avaluated based on parent.
     */
    case container.display === DisplayFlag.Inherit && container.dimensions != null:
      dRef = evaluateDimensions(container.dimensions!, parent)
      break
    default:
      throw new Error(`Something went terribly wrong with dimensions on: ${container.name}`)
  }
  return dRef
}

function resolvePositions(
  stack: Container,
  stackD: Dimensions<number>,
  parentP: Position<number>,
  parentD: Dimensions<number>
): Position<number> {
  let pRef = <Position<number>>{}
  switch (true) {
    /**
     * Display Absolute - No position specified
     *
     * Set position to 0,0 as default.
     */
    case stack.display === DisplayFlag.Absolute && stack.position == null:
      pRef = { x: 0, y: 0 }
      break
    /**
     * Display Inherit - No position specified
     *
     * Use parent position.
     * Unlike HTML/CSS the elements will not be displayed one after another top-down
     * But rather stacked on top of each other.
     */
    case stack.display === DisplayFlag.Inherit && stack.position == null:
      pRef.x = parentP.x
      pRef.y = parentP.y
      break
    /**
     * Display Absolute - Position specified
     */
    case stack.display === DisplayFlag.Absolute && stack.position != null:
      // Dont evaluate the position if it has expressions and we have text
      // In that case we will change the dimensions after creating the text
      // and reevaluating the position
      if (stack.text != null && stackD == null && stack.hasExpressions(stack.position!)) {
        pRef = { x: 0, y: 0 }
        break
      }

      pRef = evaluatePosition(stack.position!, stackD, _uGlobal.resolution)
      break
    /**
     * Display Inherit - Position specified
     *
     * Position relative to the parents position.
     */
    case stack.display === DisplayFlag.Inherit && stack.position != null:
      pRef = evaluatePosition(stack.position!, stackD, parentD)
      // Add parents position to the evaluated stack position
      pRef.x = (pRef.x as number) + (parentP.x as number)
      pRef.y = (pRef.y as number) + (parentP.y as number)
      break
    default:
      throw new Error(`Something went terribly wrong with dimensions on: ${stack.name}`)
  }

  return pRef
}

type TextReference = {
  text: Text
  position: Position<number>
  dimensions: Dimensions<number>
}

export function resolveText(
  stack: Container,
  stackD: Dimensions<number>,
  stackP: Position<number>,
  style: TextStyle,
  uStyle: Style
): TextReference {
  // Create text object
  const t = new Text(stack.text!, style)
  t.name = stack.name + '_text'
  // Get text dimensions
  const tm = TextMetrics.measureText(stack.text!, style)

  const tp = evaluatePosition({ x: uStyle.position.x, y: uStyle.position.y }, { w: tm.width, h: tm.height }, stackD)
  t.x = tp.x as number
  t.y = tp.y as number
  // Align with parent position
  t.x += stackP.x as number
  t.y += stackP.y as number

  return {
    text: t,
    position: tp,
    dimensions: { w: tm.width, h: tm.height },
  } satisfies TextReference
}

// Create pixi text style
function resolveTextStyle(uStyle: Style): TextStyle {
  return new TextStyle({
    fontFamily: uStyle.font,
    fontSize: uStyle.size,
    fill: uStyle.color,
  })
}

function resolveFlex(
  parent: RenderReference | RenderReference,
  flexParent: Container,
  children: Array<Container>
): void {
  const ref: Array<RenderReference> = []
  const pRef = resolveContainer(flexParent, parent)
  ref.push(pRef)

  const maxSpace = flexParent.flex.includes(DisplayFlag.FlexRow)
    ? (pRef.dimensions!.w as number) // Left to right display
    : (pRef.dimensions!.h as number) // Top to bottom display

  let fixedSpace = 0
  let dynamicCount = 0
  // Calculate space
  children.forEach((c: Container) => {
    if (c.flex.includes(DisplayFlag.FlexFixed)) {
      if (c.dimensions == null) {
        throw new Error(`No dimensions provided for fixed flex child ${c.name}`)
      }
      fixedSpace += c.dimensions.w as number // fixed container cant have expressions
    } else if (c.flex.push(DisplayFlag.FlexDynamic)) {
      ++dynamicCount
    } else {
      throw new Error(`No flex display option provided for ${c.name}`)
    }
  })

  const dynamicMaxSpace = maxSpace - fixedSpace
  const dynamicSpacePerChild = dynamicMaxSpace / dynamicCount

  // Apply dimension
  let currentPosition = 0
  children.forEach((c: Container) => {
    const cP = <Position<number>>{
      x: c.position ? c.position.x : 0,
      y: c.position ? c.position.y : 0,
    }
    const cD = <Dimensions<number>>{
      w: c.dimensions ? c.dimensions.w : 0,
      h: c.dimensions ? c.dimensions.h : 0,
    }
    if (c.flex.includes(DisplayFlag.FlexDynamic)) {
      if (flexParent.flex.includes(DisplayFlag.FlexRow)) {
        cD.w = dynamicSpacePerChild
        cD.h = pRef.dimensions!.h as number
      } else {
        cD.h = dynamicSpacePerChild
        cD.w = pRef.dimensions!.w as number
      }
    }
    if (flexParent.flex.includes(DisplayFlag.FlexRow)) {
      cP.x = currentPosition
    } else {
      cP.y = currentPosition
    }
    currentPosition += cD.w as number

    c.dimensions = cD
    c.position = cP
  })
}
