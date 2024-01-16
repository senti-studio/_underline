import { evaluateDimensions, evaluatePosition } from './expressions'
import { Dimensions, DisplayFlag, Position, RenderReference } from './types'
import { Style, _underlineStyle, getStyle } from './_uStyle'
import { _uGlobal } from './_uGlobal'
import { Text, TextMetrics, TextStyle } from 'pixi.js'
import { Container, ContainerReference } from './stacks'

/*
const resolvePaddings = (stack: StackReference, parent: RenderReference): void => {
  if (parent.paddings == null) return
  if (stack.display === DisplayFlag.Absolute) return

  //Left side touches
  stack.position.x += parent.paddings.l
  // Right side touches
  if (stack.dimensions.w >= parent.dimensions.w) {
    stack.dimensions.w -= parent.paddings.r
  }
  // Top side touches
  stack.position.y += parent.paddings.t
  // Bottom side touches
  if (stack.dimensions.h >= parent.dimensions.h) {
    // Keep it inside parents boundries
    stack.dimensions.h = parent.dimensions.h
    // Subtract the padding
    stack.dimensions.h -= parent.paddings.b
  }
}*/

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
      console.warn(`Current stack is absolute but has no dimensions: ${stack}`)
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
      if (stack.text != null && stack.dimensions == null && stack.hasExpressions(stack.position!)) {
        pRef = { x: 0, y: 0 }
        break
      }

      pRef = evaluatePosition(stack.position!, stack.dimensions!, _uGlobal.resolution)
      break
    /**
     * Display Inherit - Position specified
     */
    case stack.display === DisplayFlag.Inherit && stack.position != null:
      pRef = evaluatePosition(stack.position!, stack.dimensions!, parentD)
      // Add parents position to the evaluated stack position
      pRef.x = (pRef.x as number) + (parentP.x as number)
      pRef.y = (pRef.y as number) + (parentP.y as number)
      break
    default:
      throw new Error(`Something went terribly wrong with dimensions on: ${stack.name}`)
  }

  return pRef
}

/*
const resolveFlex = (stack: StackReference, parent: RenderReference): StackReference => {
  if (stack.dimensions == null) {
    throw new Error(`No dimensions provided for flex parent ${stack}`)
  }

  const maxSpace =
    stack.display === DisplayFlag.FlexRow
      ? (stack.dimensions.w as number) // Left to right display
      : (stack.dimensions.h as number) // Top to bottom display

  let fixedSpace = 0
  let dynamicCount = 0
  // Calculate space
  stack.children.forEach((c: Stack) => {
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
  stack.children.forEach((c: Stack) => {
    const cDraw = <DrawReference>{
      position: c.position,
      dimensions: c.dimensions,
    }
    //TODO: Recursive call for all children
    // prettier-ignore
    if (c.display === DisplayFlag.FlexDynamic) {
      stack.display === DisplayFlag.FlexRow 
        ? (cDraw.dimensions.w = dynamicSpacePerChild) 
        : (cDraw.dimensions.h = dynamicSpacePerChild)
    }
    const cRef = <StackReference>{ name: c.name, ref: cDraw }
    ref.children.push(cRef)
  })

  return ref
}*/

type TextReference = {
  text: Text
  position: Position<number>
  dimensions: Dimensions<number>
}

export const resolveText = (
  stack: Container,
  stackD: Dimensions<number>,
  style: TextStyle,
  uStyle: Style
): TextReference => {
  // Create text object
  const t = new Text(stack.text, style)
  t.name = stack.name + '_text'
  // Get text dimensions
  const tm = TextMetrics.measureText(stack.text, style)

  const tp = evaluatePosition({ x: uStyle.position.x, y: uStyle.position.y }, { w: tm.width, h: tm.height }, stackD)
  t.x = tp.x as number
  t.y = tp.y as number
  //TODO: look into padding
  // applyPadding({ x: t.x, y: t.y }, stack.padding)

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

export const resolve = (stack: Container, parent: RenderReference): ContainerReference => {
  // Resolve expressions
  let d = resolveDimensions(stack, parent.dimensions)
  const p = resolvePositions(stack, parent.position, parent.dimensions)

  let tRef = null
  let tStyle = null
  if (stack.text != null) {
    // Get given style or default fallback
    const uStyle = getStyle(stack.textStyle)
    tStyle = resolveTextStyle(uStyle)
    tRef = resolveText(stack, d, tStyle, uStyle)
    // If the stack doesnt have dimensions, it scales of of the text dimensions
    // in which case we can just pass them on (even if its display absolute)
    if (stack.dimensions == null) {
      d = { w: tRef.dimensions.w, h: tRef.dimensions.h }
    }
  }

  const sRef = {
    name: stack.name,
    container: stack.container,
    display: stack.display,
    dimensions: d,
    position: p,
    fill: stack.fill,
    border: stack.border,
    padding: stack.padding,
    text: tRef ? tRef.text : null,
    textStyle: tStyle,
  } satisfies ContainerReference

  // resolvePaddings(sRef, stack, parent)

  return sRef
}
