import { Container, Graphics, Transform } from "pixi.js"

export enum DisplayFlag {
  Inherit = 0,
  Absolute = 1 << 0,
  FlexRow = 2 << 0,
  FlexCol = 2 << 1,
  FlexFixed = 3 << 0,
  FlexDynamic = 3 << 1,
}

enum TransformType {
  Width,
  Height,
  X,
  Y,
}

type TransformExpression = number | string
type TinyDisplay = Container
type TinyRect = { w: TransformExpression; h: TransformExpression }
type TinyBorder = { width: number; color: string }
type TinyPosition = { x: TransformExpression; y: TransformExpression }

class TinyStack {
  public readonly container: Graphics = new Graphics()
  public display: DisplayFlag = DisplayFlag.Inherit
  public rect: TinyRect | null = null
  public border: TinyBorder | null = null
  public position: TinyPosition = { x: 0, y: 0 }
  public fill: string | null = null

  private _children: Array<TinyStack> = []
  get children(): Array<TinyStack> {
    return this._children
  }

  public add(child: TinyStack): number {
    return this._children.push(child) - 1
  }
}
let _stack: TinyStack
let _currentStack: TinyStack | null = null
let _parent: TinyDisplay

export const begin = (parent?: TinyDisplay): void => {
  // Assign parent if first call
  if (_parent === undefined && parent === null) {
    throw new Error("First TinyGui call needs a parent to draw to")
  }
  if (_parent !== undefined && parent !== null) {
    throw new Error("Parent already set. Did you forget to end() a draw?")
  }
  if (_parent === undefined) _parent = parent as TinyDisplay
  // Create base stack
  if (_stack === undefined) {
    _stack = new TinyStack()
    _currentStack = _stack
    return
  }
  // Creeate child stack
  const child = new TinyStack()
  _currentStack = child
  _stack.add(child)
}

export const end = (): void => {
  // End current stack (if its not the main)
  if (_currentStack !== null && _stack.children !== undefined) {
    _currentStack = null
    return
  }
  // End main stack and draw to parent
  _draw()
  // Clear stack
  _stack = <TinyStack>{}
  _currentStack = _stack
}

export const rect = (w: number | string, h: number | string): void => {
  const currentStack = _ensureOpenStack()
  currentStack.rect = { w: w, h: h }
}

export const fill = (color: string): void => {
  const currentStack = _ensureOpenStack()
  currentStack.fill = color
}

export const display = (type: DisplayFlag): void => {
  const currentStack = _ensureOpenStack()
  currentStack.display = type
}

export const border = (width: number, color: string): void => {
  const currentStack = _ensureOpenStack()
  currentStack.border = { width: width, color: color }
}

export const position = (x: number | string, y: number | string): void => {
  const currentStack = _ensureOpenStack()
  currentStack.position = { x: x, y: y }
}

const _ensureOpenStack = (): TinyStack => {
  if (_currentStack === null) {
    throw new Error("No current stack. Did you forget to begin() ?")
  }
  return _currentStack
}

const _draw = (): void => {
  const currentStack = _ensureOpenStack()

  if (
    _stack.display === DisplayFlag.FlexRow ||
    _stack.display === DisplayFlag.FlexCol
  ) {
    _drawFlex(currentStack)
    return
  }
  _drawNormal(currentStack)
}

const _drawFlex = (stack: TinyStack) => {
  if (stack.rect === null) {
    throw new Error(`No rect provided for flex parent ${stack}`)
  }
  _drawNormal(stack)

  const maxChilds = stack.children.length
  const maxSpace =
    stack.display === DisplayFlag.FlexRow
      ? (stack.rect!.w as number)
      : (stack.rect!.h as number)

  let fixedSpace = 0
  let dynamicCount = 0
  stack.children.forEach((c: TinyStack) => {
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

  stack.children.forEach((c: TinyStack) => {
    if (c.display === DisplayFlag.FlexDynamic) {
      stack.display === DisplayFlag.FlexRow
        ? (c.rect!.w = dynamicSpacePerChild)
        : (c.rect!.h = dynamicSpacePerChild)
    }

    _drawNormal(c, stack.container)
  })
}

const _drawNormal = (
  currentStack: TinyStack,
  parent: TinyDisplay = _parent
) => {
  const c = currentStack.container
  // Apply properties to container
  currentStack.fill !== null
    ? c.beginFill(currentStack.fill as string)
    : c.beginFill()
  if (currentStack.border !== null) {
    c.lineStyle(
      currentStack.border!.width,
      currentStack.border!.color ?? "#000"
    )
  }
  let x = 0
  let y = 0
  if (currentStack.position !== undefined) {
    x =
      typeof currentStack.position.x === "number"
        ? currentStack.position.x
        : _evaluateExpression(
            currentStack.position.x,
            TransformType.X,
            _parent,
            c
          )
    y =
      typeof currentStack.position.y === "number"
        ? currentStack.position.y
        : _evaluateExpression(
            currentStack.position.y,
            TransformType.Y,
            _parent,
            c
          )
  }
  let w = 0
  let h = 0
  if (currentStack.rect !== null) {
    w =
      typeof currentStack.rect!.w === "number"
        ? currentStack.rect!.w
        : _evaluateExpression(
            currentStack.rect.w,
            TransformType.Width,
            _parent,
            c
          )

    h =
      typeof currentStack.rect!.h === "number"
        ? currentStack.rect!.h
        : _evaluateExpression(
            currentStack.rect.h,
            TransformType.Height,
            _parent,
            c
          )

    c.drawRect(x, y, w, h)
  }
  // Add container to parent
  parent.addChild(currentStack.container)
}

const _evaluateExpression = (
  exp: TransformExpression,
  type: TransformType,
  parent: TinyDisplay,
  ref: TinyDisplay
): number => {
  let baseValue = 0
  let refValue = 0
  switch (type) {
    case TransformType.Width:
    case TransformType.X:
      baseValue = Math.round(parent.width)
      refValue = Math.round(ref.width)
      break
    case TransformType.Height:
    case TransformType.Y:
      baseValue = Math.round(parent.height)
      refValue = Math.round(ref.height)
  }

  if (exp === "100%") return baseValue
  if (exp === "50%") return baseValue / 2
  if (exp === "center") return baseValue / 2 - refValue / 2

  return 0
}
