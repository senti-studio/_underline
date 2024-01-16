import { _uBase, Area, DisplayFlag, RenderReference } from './types'
import { resolve } from './resolver'
import { Container, ContainerReference, addReference, ensureOpenStack, getCurrentStack, setCurrent } from './stacks'

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
  const current = ensureOpenStack()
  if (current.parent != null) {
    throw new Error('Stack still has children, did you forget to call end() somewhere?')
  }
  const resolvedStack = resolve(current, reference)
  addReference(resolvedStack)
  applyTransforms(current, resolvedStack, reference)
  setCurrent(null)
}

_u.begin = (name: string): void => {
  setCurrent(new Container(name))
}

_u.dimension = (w: number | string, h: number | string): void => {
  const current = ensureOpenStack()
  current.dimensions = { w: w, h: h }
}

_u.fill = (color: string): void => {
  const current = ensureOpenStack()
  current.fill = color
}

_u.display = (type: DisplayFlag): void => {
  const current = ensureOpenStack()
  current.display = type
}

_u.border = (width: number, color: string): void => {
  const current = ensureOpenStack()
  current.border = { width: width, color: color }
}

_u.position = (x: number | string, y: number | string): void => {
  const current = ensureOpenStack()
  current.position = { x: x, y: y }
}

_u.text = (text: string, style?: string): void => {
  const current = ensureOpenStack()
  current.text = text
  current.textStyle = style ?? ''
}

_u.padding = (p1: number, p2?: number, p3?: number, p4?: number): void => {
  const current = ensureOpenStack()

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

  current.padding = padding
}

const applyTransforms = (stack: Container, sRef: ContainerReference, parent: RenderReference): void => {
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
