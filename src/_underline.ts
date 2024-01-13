import { _uBase, Area, DisplayFlag, RenderReference } from './types'
import { resolve } from './resolver'
import { Stack, StackReference, addReference, ensureOpenStack, getCurrentStack, setCurrentStack } from './stacks'

export interface _underline extends _uBase {
  /**
   * Renders all objects to the given reference.
   * @param reference - Reference on which to draw to
   */
  renderTo(reference: RenderReference): void
  /**
   * Gives the shape a dimensions, if not used, the shape of the parent is taken.
   * @param w - Width of the shape, can also be an expression like '100%'
   * @param h - Height of the shape, can also be an expression like '100%'
   */
  dimension(w: number | string, h: number | string): void
  /**
   * Fills the shape with the given color, if not used, the shape is transparent.
   * @param color - Fill color for the shape
   */
  fill(color: string): void
  /**
   * Default display is Inherit.
   * @param type - Display type of the shape, for example Flex, Absolute, ...
   */
  display(type: DisplayFlag): void
  /**
   * Adds a border to the shape.
   * @param width - Border width
   * @param color - Border color
   */
  border(width: number, color: string): void
  /**
   * Adds a position to the shape, if not used, the position of the parent is used.
   * @param x - Position x
   * @param y - Position y
   */
  position(x: number | string, y: number | string): void

  text(text: string, style?: string): void

  padding(t: number, r: number, b: number, l: number): void
  padding(tb: number, rl: number): void
  padding(all: number): void
}

export const _u: _underline = <_underline>{}

_u.renderTo = (reference: RenderReference): void => {
  const currentStack = ensureOpenStack()
  if (currentStack.parent != null) {
    throw new Error('Stack still has children, did you forget to call end() somewhere?')
  }
  // End main stack and draw to parent
  const resolvedStack = resolve(currentStack, reference)
  addReference(resolvedStack)
  applyTransforms(currentStack, resolvedStack, reference)
  // Clear stack
  setCurrentStack(null)
}

_u.end = (): void => {
  const currentStack = ensureOpenStack()
  // End current stack (if its not the main)
  if (currentStack.parent != null) {
    setCurrentStack(currentStack.parent)
    return
  }
}

_u.begin = (name: string): void => {
  // Create base stack
  let s: Stack
  if (getCurrentStack() == null) {
    // Create main stack
    setCurrentStack(new Stack(name))
  } else {
    // Creeate child stack
    const currentStack = getCurrentStack()
    s = new Stack(name, currentStack!)
    // Add child to current stack
    currentStack!.add(s)
    // Make child the new current stack
    setCurrentStack(s)
  }
}

_u.dimension = (w: number | string, h: number | string): void => {
  const currentStack = ensureOpenStack()
  currentStack.dimensions = { w: w, h: h }
}

_u.fill = (color: string): void => {
  const currentStack = ensureOpenStack()
  currentStack.fill = color
}

_u.display = (type: DisplayFlag): void => {
  const currentStack = ensureOpenStack()
  currentStack.display = type
}

_u.border = (width: number, color: string): void => {
  const currentStack = ensureOpenStack()
  currentStack.border = { width: width, color: color }
}

_u.position = (x: number | string, y: number | string): void => {
  const currentStack = ensureOpenStack()
  currentStack.position = { x: x, y: y }
}

_u.text = (text: string, style?: string): void => {
  const currentStack = ensureOpenStack()
  currentStack.text = text
  currentStack.textStyle = style ?? ''
}

_u.padding = (p1: number, p2?: number, p3?: number, p4?: number): void => {
  const currentStack = ensureOpenStack()

  let padding = <Area>{}
  if (p3 != null && p4 != null) {
    padding.t = p1
    padding.r = p2 as number
    padding.b = p3 as number
    padding.l = p3 as number
  } else if (p2 != null && p3 == null && p4 == null) {
    padding.t = p1
    padding.r = p2 as number
    padding.b = p1
    padding.l = p2 as number
  } else {
    padding.t = p1
    padding.r = p1
    padding.b = p1
    padding.l = p1
  }

  currentStack.padding = padding
}

const applyTransforms = (stack: Stack, sRef: StackReference, parent: RenderReference): void => {
  // Apply properties to container
  const c = stack.container
  // Begin fill
  if (stack.fill != null) c.beginFill(stack.fill as string)
  // Draw border
  if (stack.border != null) {
    c.lineStyle(stack.border!.width, stack.border!.color ?? '#000')
  }

  // Draw text
  /*if (stack.text !== '') {
    const t = resolveText(stack)
    c.addChild(t!.container)
    // Address dimensions
    if (stack.display === DisplayFlag.Absolute) {
      // After we have dimensions, we need to reevaluate
      // the position expressions (in case there are some)
      resolvePosition(stack, parent.position, parent.dimensions)
      // We also need to reevaluate the text position
      // now that the dimensions may have changed
      const ct = stack.container.getChildByName(stack.name + '_text')!
      ct.x += stack.position!.x as number
      ct.y += stack.position!.y as number
    }
  }*/
  // Draw shape
  c.drawRect(sRef.position.x, sRef.position.y, sRef.dimensions.w, sRef.dimensions.h)
  // Add to parent
  parent.container.addChild(c)
}
