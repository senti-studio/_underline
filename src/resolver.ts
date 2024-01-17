import { evaluateDimensions, evaluatePosition } from './expressions'
import { Dimensions, DisplayFlag, Position, RenderReference } from './types'
import { Style, _underlineStyle, getStyle } from './_uStyle'
import { _uGlobal } from './_uGlobal'
import { Text, TextMetrics, TextStyle } from 'pixi.js'
import { Container, ContainerReference, ContainerStack, ReferenceStack } from './stacks'

export const resolve = (stack: ContainerStack, parent: RenderReference): ReferenceStack => {
  const ref = new Map()
  let flex = false
  let flexParent = null
  let flexChildren: Array<Container> = []
  stack.forEach((c: Container) => {
    if (c.display === DisplayFlag.Absolute || c.display === DisplayFlag.Inherit) {
      flex = false
    }
    if (flex) {
      flexChildren.push(c)
    } else {
      // Resole any flex children before continuing
      if (flexChildren.length > 0) {
        const flexRef = resolveFlex(flexParent!, flexChildren)
        flexRef.forEach((c: ContainerReference) => {
          ref.set(c.name, c)
        })
        flexChildren = []
        flexParent = null
      }
      // Resolve container
      const cRef = resolveContainer(c, c.parent ?? parent)
      ref.set(c.name, cRef)
      // If display is FlexRow or FlexCol -> resolve flex
      if (c.display === DisplayFlag.FlexRow || c.display === DisplayFlag.FlexCol) {
        flex = true
        flexParent = cRef
      }
    }
  })
  return ref
}

export const resolveContainer = (container: Container, parent: RenderReference | Container): ContainerReference => {
  // Resolve expressions
  let d = resolveDimensions(container, parent.dimensions as Dimensions<number>)
  d = resolvePaddings(container, d)
  let p = resolvePositions(container, d, parent.position as Position<number>, parent.dimensions as Dimensions<number>)

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
      d = resolvePaddings(container, d)
      p = resolvePositions(container, d, parent.position as Position<number>, parent.dimensions as Dimensions<number>)
      tRef = resolveText(container, d, p, tStyle, uStyle)
    }
  }

  const sRef = {
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
  } satisfies ContainerReference

  return sRef
}

const resolvePaddings = (container: Container, d: Dimensions<number>): Dimensions<number> => {
  if (container.padding != null) {
    d.w += container.padding.l + container.padding.r
    d.h += container.padding.t + container.padding.b
  }
  return d
}

const resolveDimensions = (stack: Container, parent: Dimensions<number>): Dimensions<number> => {
  let dRef = <Dimensions<number>>{}
  switch (true) {
    /**
     * Display Absolute - No dimensions specified
     *
     * Gets 0,0 dimensions as default.
     */
    case stack.display === DisplayFlag.Absolute && stack.dimensions == null:
      // Otherwise print a warning that no dimensions are set
      if (stack.text == null) {
        console.warn(`Current stack is absolute but has no dimensions: ${stack.name} will not display`)
      }
      dRef = { w: 0, h: 0 }
      break
    /**
     * Display Inherit - No dimensions specified
     *
     * Inherits dimensions from parent
     */
    case stack.display === DisplayFlag.Inherit && stack.dimensions == null:
      dRef = parent
      break
    /**
     * Display Absolute - Dimensions specified
     *
     * Expression get evaluated based on window dimensions.
     */
    case stack.display === DisplayFlag.Absolute && stack.dimensions != null:
      if (_uGlobal.resolution == null) {
        throw new Error(`Game resolution not set (Use _uGlobal.resolution)`)
      }
      const wd = <Dimensions<number>>{
        w: _uGlobal.resolution.w,
        h: _uGlobal.resolution.h,
      }
      dRef = evaluateDimensions(stack.dimensions!, wd)
      // Resolve position/paddings to give children correct dimensions
      // resolvePositionalDifferences(stack)
      break
    /**
     * Display Inherit - Dimensions specified
     *
     * Expressions get avaluated based on parent.
     */
    case stack.display === DisplayFlag.Inherit && stack.dimensions != null:
      dRef = evaluateDimensions(stack.dimensions!, parent)
      // Resolve position/paddings to give children correct dimensions
      // resolvePositionalDifferences(stack)
      break
    default:
      throw new Error(`Something went terribly wrong with dimensions on: ${stack.name}`)
  }
  return dRef
}

const resolvePositions = (
  stack: Container,
  stackD: Dimensions<number>,
  parentP: Position<number>,
  parentD: Dimensions<number>
): Position<number> => {
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
     */
    case stack.display === DisplayFlag.Inherit && stack.position == null:
      pRef = parentP
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

export const resolveText = (
  stack: Container,
  stackD: Dimensions<number>,
  stackP: Position<number>,
  style: TextStyle,
  uStyle: Style
): TextReference => {
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
const resolveTextStyle = (uStyle: Style): TextStyle => {
  return new TextStyle({
    fontFamily: uStyle.font,
    fontSize: uStyle.size,
    fill: uStyle.color,
  })
}

const resolveFlex = (parent: Container, children: Array<Container>): Array<ContainerReference> => {
  const maxSpace =
    parent.display === DisplayFlag.FlexRow
      ? (parent.dimensions!.w as number) // Left to right display
      : (parent.dimensions!.h as number) // Top to bottom display

  let fixedSpace = 0
  let dynamicCount = 0
  // Calculate space
  children.forEach((c: Container) => {
    if (c.display === DisplayFlag.FlexFixed) {
      if (c.dimensions == null) {
        throw new Error(`No dimensions provided for fixed flex child ${c}`)
      }
      fixedSpace += c.dimensions.w as number // fixed container cant have expressions
    } else if (c.display === DisplayFlag.FlexDynamic) {
      ++dynamicCount
    } else {
      throw new Error(`No flex display option provided for ${c}`)
    }
  })

  const dynamicMaxSpace = maxSpace - fixedSpace
  const dynamicSpacePerChild = dynamicMaxSpace / dynamicCount

  // Apply dimensions
  const ref: Array<ContainerReference> = []
  children.forEach((c: Container) => {
    const cP = <Position<number>>{
      x: c.position!.x,
      y: c.position!.y,
    }
    const cD = <Dimensions<number>>{
      w: c.dimensions!.w,
      h: c.dimensions!.h,
    }
    //TODO: Recursive call for all children
    // prettier-ignore
    if (c.display === DisplayFlag.FlexDynamic) {
      parent.display === DisplayFlag.FlexRow 
        ? (cD.w = dynamicSpacePerChild) 
        : (cD.h = dynamicSpacePerChild)
    }
    const cRef = (<ContainerReference>{
      name: c.name,
      container: c.container,
      display: c.display,
      position: cP,
      dimensions: cD,
      border: c.border,
      padding: c.padding,
      fill: c.fill,
      text: c.text,
      textStyle: c.textStyle,
    }) satisfies ContainerReference

    ref.push(cRef)
  })

  return ref
}
