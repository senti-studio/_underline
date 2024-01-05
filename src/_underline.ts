import { Graphics } from "pixi.js"
import { DrawReference, Border, Position, _uBase, Dimensions } from "./types"
import { resolve } from "./resolver"

export enum DisplayFlag {
  Inherit = 0,
  Absolute = 1 << 0,
  FlexRow = 2 << 0,
  FlexCol = 2 << 1,
  FlexFixed = 3 << 0,
  FlexDynamic = 3 << 1,
}

export class Stack {
  public readonly container: Graphics = new Graphics()
  public display: DisplayFlag = DisplayFlag.Inherit
  public dimensions: Dimensions | null = null
  public border: Border | null = null
  public position: Position | null = null
  public fill: string | null = null
  public text: string = ""
  public textStyle: string = ""

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

  public hasExpressions(transform: Position | Dimensions): boolean {
    let position: Position | null = null
    let dimensions: Dimensions | null = null
    if ((transform as Position).x != null) {
      position = transform as Position
    } else {
      dimensions = transform as Dimensions
    }
    // Finx expression
    if (position != null) {
      if (typeof position.x === "string") return true
      if (typeof position.y === "string") return true
    } else if (dimensions != null) {
      if (typeof dimensions.w === "string") return true
      if (typeof dimensions.h === "string") return true
    }
    return false
  }
}

let _currentStack: Stack | null = null

export interface _underline extends _uBase {
  /**
   * Renders all objects to the given reference.
   * @param reference - Reference on which to draw to
   */
  renderTo(reference: DrawReference): void
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
  resolve(currentStack, reference)
  // Clear stack
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
  if (_currentStack == null) {
    // Create main stack
    _currentStack = new Stack(name)
  } else {
    // Creeate child stack
    s = new Stack(name, _currentStack as Stack)
    _currentStack!.add(s)
    _currentStack = s
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
  currentStack.textStyle = style ?? ""
}

const ensureOpenStack = (): Stack => {
  if (_currentStack == null) {
    throw new Error("No open stack. Did you forget to begin() ?")
  }
  return _currentStack
}
