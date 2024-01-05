import { Text, TextMetrics, TextStyle } from "pixi.js"
import { DisplayFlag, Stack } from "./_underline"
import { evaluateDimensions, evaluatePosition } from "./expressions"
import { Dimensions, DrawReference, Position } from "./types"
import { _underlineStyle, getStyle } from "./_uStyle"
import { _uGlobal } from "./_uGlobal"

export const resolve = (stack: Stack, parent: DrawReference): void => {
  // Resolve expressions
  resolveDimensions(stack, parent.dimensions)
  resolvePositions(stack, parent.position, parent.dimensions)
  // Apply transforms to container
  applyTransforms(stack, parent)
  // Resolve all children
  stack.children.forEach((c: Stack) => {
    resolve(c, {
      container: stack.container,
      dimensions: stack.dimensions!,
      position: stack.position!,
    })
  })

  parent.container.addChild(stack.container)
}
const applyTransforms = (stack: Stack, parent: DrawReference): void => {
  // Apply properties to container
  const c = stack.container
  // Begin fill
  stack.fill !== null ? c.beginFill(stack.fill as string) : c.beginFill()
  // Draw border
  if (stack.border !== null) {
    c.lineStyle(stack.border!.width, stack.border!.color ?? "#000")
  }

  // Draw text
  if (stack.text !== "") {
    const t = drawText(stack)
    c.addChild(t!.container)
    // Address dimensions
    if (stack.display === DisplayFlag.Absolute && stack.dimensions == null) {
      stack.dimensions = t!.dimensions
      // After we have dimensions, we need to reevaluate
      // the position expressions (in case there are some)
      resolvePositions(stack, parent.position, parent.dimensions)
      // We also need to reevaluate the text position
      // now that the dimensions may have changed
      const ct = stack.container.getChildByName(stack.name + "_text")!
      ct.x += stack.position!.x as number
      ct.y += stack.position!.y as number
    }
  }
  // Draw shape
  c.drawRect(
    stack.position!.x as number,
    stack.position!.y as number,
    stack.dimensions!.w as number,
    stack.dimensions!.h as number
  )
}

const drawText = (stack: Stack): DrawReference => {
  // Get given style or default fallback
  const uStyle = getStyle(stack.textStyle)
  // Create pixi text style
  const style = new TextStyle({
    fontFamily: uStyle?.font,
    fontSize: uStyle?.size,
    fill: uStyle?.color,
  })
  // Create text object
  const t = new Text(stack.text, style)
  t.name = stack.name + "_text"
  // Get text dimensions
  const tm = TextMetrics.measureText(stack.text, style)
  const tp = resolveTextPosition(stack, t)

  stack.container.addChild(t)

  return {
    container: t,
    position: tp,
    dimensions: { w: tm.width, h: tm.height },
  }
}

const resolveTextPosition = (stack: Stack, t: Text): Position => {
  // Get given style or default fallback
  const uStyle = getStyle(stack.textStyle)
  // Create pixi text style
  const style = new TextStyle({
    fontFamily: uStyle?.font,
    fontSize: uStyle?.size,
    fill: uStyle?.color,
  })
  // Get text dimensions
  const tm = TextMetrics.measureText(stack.text, style)
  let stackD = stack.dimensions
  console.log("stack d is", stackD)
  // If the stack doesnt have dimensions, it scales of of the text dimensions
  // in which case we can just pass them on
  if (stackD == null) stackD = { w: tm.width, h: tm.height }
  // Evaluate style expressions
  const tp = evaluatePosition(
    { x: uStyle.position.x, y: uStyle.position.y },
    { w: tm.width, h: tm.height },
    stackD
  )
  t.x = tp.x as number
  t.y = tp.y as number

  return tp
}

const resolveDimensions = (stack: Stack, parent: Dimensions): void => {
  switch (true) {
    // Display absolute requires dimensions
    case stack.display === DisplayFlag.Absolute && stack.dimensions == null:
      if (stack.text != null) return //With text, we use the text dimensions
      // Otherwise print a warning that no dimensions are set
      console.warn(`Current stack is absolute but has no dimensions: ${stack}`)
      stack.dimensions = { w: 0, h: 0 }
      return
    // Inherited display from parent
    case stack.display === DisplayFlag.Inherit && stack.dimensions == null:
      stack.dimensions = parent
      break
    // Display absolute expression get evaluated based on window dimensions
    case stack.display === DisplayFlag.Absolute && stack.dimensions != null:
      if (_uGlobal.resolution == null) {
        throw new Error(`Game resolution not set (Use _uGlobal.resolution)`)
      }
      const wd = <Dimensions>{
        w: _uGlobal.resolution.w,
        h: _uGlobal.resolution.h,
      }
      stack.dimensions = evaluateDimensions(stack.dimensions!, wd)
      // Resolve position/paddings to give children correct dimensions
      // resolvePositionalDifferences(stack)
      break
    // Inherited display expressions get avaluated based on parent
    case stack.display === DisplayFlag.Inherit && stack.dimensions != null:
      stack.dimensions = evaluateDimensions(stack.dimensions!, parent)
      // Resolve position/paddings to give children correct dimensions
      // resolvePositionalDifferences(stack)
      break
    default:
      throw new Error(
        `Something went terribly wrong with dimensions on: ${stack.name}`
      )
  }
}
const resolvePositions = (
  stack: Stack,
  parentP: Position,
  parentD: Dimensions
): void => {
  switch (true) {
    case stack.display === DisplayFlag.Absolute && stack.position == null:
      stack.position = { x: 0, y: 0 }
      return
    case stack.display === DisplayFlag.Inherit && stack.position == null:
      stack.position = parentP
      break
    case stack.display === DisplayFlag.Absolute && stack.position != null:
      // Dont evaluate the position if it has expressions and we have text
      // In that case we will change the dimensions after creating the text
      // and reevaluating the position
      if (
        stack.text != null &&
        stack.dimensions == null &&
        stack.hasExpressions(stack.position!)
      )
        return

      stack.position = evaluatePosition(
        stack.position!,
        stack.dimensions!,
        _uGlobal.resolution
      )
      break
    case stack.display === DisplayFlag.Inherit && stack.position != null:
      stack.position = evaluatePosition(
        stack.position!,
        stack.dimensions!,
        parentD
      )
      stack.position.x = (stack.position.x as number) + (parentP.x as number)
      stack.position.y = (stack.position.y as number) + (parentP.x as number)
      break
    default:
      throw new Error(
        `Something went terribly wrong with dimensions on: ${stack.name}`
      )
  }
}

/*export const draw = (parent: DrawReference, currentStack: Stack): void => {
  if (
    currentStack.display === DisplayFlag.FlexRow ||
    currentStack.display === DisplayFlag.FlexCol
  ) {
    drawFlex(currentStack, parent)
    return
  }

  const p = drawNormal(currentStack, parent)
  drawStacks(currentStack.children, p)

  parent.container.addChild(p.container)
}*/

/*
const drawFlex = (stack: Stack, parent: DrawReference) => {
  if (stack.dimensions === null) {
    throw new Error(`No rect provided for flex parent ${stack}`)
  }
  const parentRef = drawNormal(stack, parent)

  const maxSpace =
    stack.display === DisplayFlag.FlexRow
      ? (stack.dimensions!.w as number)
      : (stack.dimensions!.h as number)

  let fixedSpace = 0
  let dynamicCount = 0
  stack.children.forEach((c: Stack) => {
    if (c.display === DisplayFlag.FlexFixed) {
      if (c.dimensions === null) {
        throw new Error(`No rect provided for fixed flex child ${c}`)
      }
      fixedSpace += c.dimensions!.w as number // fixed container cant have expression
    } else if (c.display === DisplayFlag.FlexDynamic) {
      ++dynamicCount
    } else {
      throw new Error(`No flex display option provided for ${c}`)
    }
  })

  const dynamicMaxSpace = maxSpace - fixedSpace
  const dynamicSpacePerChild = dynamicMaxSpace / dynamicCount

  stack.children.forEach((c: Stack) => {
    if (c.display === DisplayFlag.FlexDynamic) {
      stack.display === DisplayFlag.FlexRow
        ? (c.dimensions!.w = dynamicSpacePerChild)
        : (c.dimensions!.h = dynamicSpacePerChild)
    }

    drawNormal(c, parentRef)
  })
}
*/
