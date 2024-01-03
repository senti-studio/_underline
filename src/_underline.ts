import { Container, Graphics } from "pixi.js"
import {
  TinyBorder,
  TinyPosition,
  TinyRect,
  TransformExpression,
} from "./types"
import { evaluate } from "./expressions"

export enum DisplayFlag {
  Inherit = 0,
  Absolute = 1 << 0,
  FlexRow = 2 << 0,
  FlexCol = 2 << 1,
  FlexFixed = 3 << 0,
  FlexDynamic = 3 << 1,
}

export type DrawReference = {
  container: Container
  width: number
  height: number
  x: number
  y: number
}

export class Stack {
  public readonly container: Graphics = new Graphics()
  public display: DisplayFlag = DisplayFlag.Inherit
  public rect: TinyRect | null = null
  public border: TinyBorder | null = null
  public position: TinyPosition = { x: 0, y: 0 }
  public fill: string | null = null

  constructor(
    public readonly name: string,
    public readonly parent?: Stack
  ) {
    this.container.name = name
  }

  private _children: Array<Stack> = []
  get children(): Array<Stack> {
    return this._children
  }

  public add(child: Stack): void {
    this._children.push(child)
  }
}

let _stack: Stack
let _currentStack: Stack | null = null

export interface _underline {
  /**
   * Renders all objects to the given reference.
   * @param reference - Reference on which to draw to
   */
  renderTo(reference: DrawReference): void
  /**
   * Ends the current draw operation and adds all graphical objects to the parent.
   */
  end(): void
  /**
   * Creates a new graphical objects.
   * @param name - Either use #name for a unique name, or .name for repetables
   */
  begin(name: string): void
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
}

export const _u: _underline = <_underline>{}

_u.renderTo = (reference: DrawReference): void => {
  const currentStack = ensureOpenStack()
  if (currentStack.parent != null) {
    throw new Error(
      "Stack still has children, did you forget to call end() somewhere?"
    )
  }
  // End main stack and draw to parent
  draw(reference)
  // Clear stack
  _stack = <Stack>{}
  _currentStack = null
}

_u.end = (): void => {
  const currentStack = ensureOpenStack()
  // End current stack (if its not the main)
  if (currentStack.parent != null) {
    _currentStack = currentStack.parent
    return
  }
}

_u.begin = (name: string): void => {
  // Create base stack
  let s: Stack
  if (_stack == null) {
    // Create main stack
    _stack = new Stack(name)
    _currentStack = _stack
  } else {
    // Creeate child stack
    s = new Stack(name, _currentStack as Stack)
    _currentStack!.add(s)
    _currentStack = s
  }
}

_u.dimension = (w: number | string, h: number | string): void => {
  const currentStack = ensureOpenStack()
  currentStack.rect = { w: w, h: h }
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

const ensureOpenStack = (): Stack => {
  if (_currentStack == null) {
    throw new Error("No open stack. Did you forget to begin() ?")
  }
  return _currentStack
}

const draw = (parent: DrawReference): void => {
  const currentStack = ensureOpenStack()
  console.log("drawing stack", currentStack)
  console.log("it has children:", currentStack.children.length)
  if (
    _stack.display === DisplayFlag.FlexRow ||
    _stack.display === DisplayFlag.FlexCol
  ) {
    drawFlex(currentStack, parent)
    return
  }

  const p = drawNormal(currentStack, parent)
  drawStacks(currentStack.children, p)

  parent.container.addChild(p.container)
}

const drawStacks = (stacks: Array<Stack>, parent: DrawReference): void => {
  stacks.forEach((stack: Stack) => {
    console.log("stack", stack.name, "has children:", stack.children.length)
    let p = drawNormal(stack, parent)
    if (stack.children.length > 0) drawStacks(stack.children, p)
  })
}

const drawFlex = (stack: Stack, parent: DrawReference) => {
  if (stack.rect === null) {
    throw new Error(`No rect provided for flex parent ${stack}`)
  }
  const parentRef = drawNormal(stack, parent)

  const maxSpace =
    stack.display === DisplayFlag.FlexRow
      ? (stack.rect!.w as number)
      : (stack.rect!.h as number)

  let fixedSpace = 0
  let dynamicCount = 0
  stack.children.forEach((c: Stack) => {
    if (c.display === DisplayFlag.FlexFixed) {
      if (c.rect === null) {
        throw new Error(`No rect provided for fixed flex child ${c}`)
      }
      fixedSpace += c.rect!.w as number // fixed container cant have expression
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
        ? (c.rect!.w = dynamicSpacePerChild)
        : (c.rect!.h = dynamicSpacePerChild)
    }

    drawNormal(c, parentRef)
  })
}

const drawNormal = (
  currentStack: Stack,
  parent: DrawReference
): DrawReference => {
  const c = currentStack.container
  // Apply properties to container
  // Begin fill
  currentStack.fill !== null
    ? c.beginFill(currentStack.fill as string)
    : c.beginFill()
  // Draw border
  if (currentStack.border !== null) {
    c.lineStyle(
      currentStack.border!.width,
      currentStack.border!.color ?? "#000"
    )
  }
  // Evaluate expressions
  let tw: TransformExpression
  let th: TransformExpression
  if (currentStack.rect !== null) {
    tw = currentStack.rect.w
    th = currentStack.rect.h
  } else {
    tw = parent.width
    th = parent.height
  }
  let tx: TransformExpression = 0
  let ty: TransformExpression = 0
  if (currentStack.position !== undefined) {
    tx = currentStack.position.x
    ty = currentStack.position.y
  }
  const r = evaluate(tx, ty, tw, th, currentStack, parent)

  c.drawRect(r.x, r.y, r.width, r.height)

  // Add container to parent
  parent.container.addChild(c)
  return { container: c, width: r.width, height: r.height, x: r.x, y: r.y }
}
