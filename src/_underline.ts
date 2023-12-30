import { Container, Graphics } from "pixi.js";

export enum DisplayFlag {
  Inherit = 0,
  Absolute = 1 << 0,
  FlexRow = 2 << 0,
  FlexCol = 2 << 1,
  FlexFixed = 3 << 0,
  FlexDynamic = 3 << 1,
}

type TinyDisplay = Container;
type TinyRect = { w: number | string; h: number | string };
type TinyBorder = { width: number; color: string };
type TinyPosition = { x: number | string; y: number | string };

class TinyStack {
  public readonly container: Graphics = new Graphics();
  public display: DisplayFlag = DisplayFlag.Inherit;
  public rect: TinyRect | null = null;
  public border: TinyBorder | null = null;
  public position: TinyPosition = { x: 0, y: 0 };
  public fill: string | null = null;

  private _children: Array<TinyStack> = [];
  get children(): Array<TinyStack> {
    return this._children;
  }

  public add(child: TinyStack): number {
    return this._children.push(child) - 1;
  }
}
let _stack: TinyStack;
let _currentStack: TinyStack | null = null;
let _parent: TinyDisplay;

export const begin = (parent?: TinyDisplay): void => {
  // Assign parent if first call
  if (_parent === undefined && parent === null) {
    throw new Error("First TinyGui call needs a parent to draw to");
  }
  if (_parent !== undefined && parent !== null) {
    throw new Error("Parent already set. Did you forget to end() a draw?");
  }
  if (_parent === undefined) _parent = parent as TinyDisplay;
  // Create base stack
  if (_stack === undefined) {
    _stack = new TinyStack();
    _currentStack = _stack;
    return;
  }
  // Creeate child stack
  const child = new TinyStack();
  _currentStack = child;
  _stack.add(child);
};

export const end = (): void => {
  // End current stack if its not the main
  if (_currentStack !== null && _stack.children !== undefined) {
    _currentStack = null;
    return;
  }
  // End main stack and draw to parent
  _draw();
  // Clear stack
  _stack = <TinyStack> {};
  _currentStack = _stack;
};

export const rect = (w: number | string, h: number | string): void => {
  const currentStack = _ensureOpenStack();
  currentStack.rect = { w: w, h: h };
};

export const fill = (color: string): void => {
  const currentStack = _ensureOpenStack();
  currentStack.fill = color;
};

export const display = (type: DisplayFlag): void => {
  const currentStack = _ensureOpenStack();
  currentStack.display = type;
};

export const border = (width: number, color: string): void => {
  const currentStack = _ensureOpenStack();
  currentStack.border = { width: width, color: color };
};

export const position = (x: number | string, y: number | string): void => {
  const currentStack = _ensureOpenStack();
  currentStack.position = { x: x, y: y };
};

const _ensureOpenStack = (): TinyStack => {
  if (_currentStack === null) {
    throw new Error("No current stack. Did you forget to begin() ?");
  }
  return _currentStack;
};

const _draw = (): void => {
  if (
    _stack.display === DisplayFlag.FlexRow ||
    _stack.display === DisplayFlag.FlexCol
  ) {
    _drawFlex();
    return;
  }
  _drawNormal();
};

const _drawFlex = () => {
};

const _drawNormal = () => {
  const currentStack = _ensureOpenStack();
  const c = currentStack.container;
  // Apply properties to container
  currentStack.fill !== null
    ? c.beginFill(currentStack.fill as string)
    : c.beginFill();
  if (currentStack.border !== null) {
    c.lineStyle(
      currentStack.border!.width,
      currentStack.border!.color ?? "#000",
    );
  }
  let x = 0;
  let y = 0;
  if (currentStack.position !== undefined) {
    x = typeof currentStack.position.x === "number"
      ? currentStack.position.x
      : 0;
    y = typeof currentStack.position.y === "number"
      ? currentStack.position.y
      : 0;
  }
  let w = 0;
  let h = 0;
  if (currentStack.rect !== null) {
    w = typeof currentStack.rect!.w === "number" ? currentStack.rect!.w : 0;
    h = typeof currentStack.rect!.h === "number" ? currentStack.rect!.h : 0;
    c.drawRect(x, y, w, h);
  }
  // Add container to parent
  _parent.addChild(currentStack.container);
};
