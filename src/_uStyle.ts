import { Position, _uBase } from './types'

type Styles = { [name: string]: Style }
const _stack: Styles = {}
let _currentStack: Style | null

export class Style {
  public font: string = 'Arial'
  public size: number = 16
  public color: string = '#000'
  public position: Position<string | number> = { x: 0, y: 0 }

  constructor(public readonly name: string) {}
}

export const getStyle = (name: string = '_default'): Style => {
  return _stack[name] ?? new Style('_default')
}

export interface _underlineStyle extends _uBase {
  /**
   * Name of the font asset.
   * @param name - Font name
   */
  font(name: string): void
  /**
   * Size of the font.
   * @param size - Font size
   */
  size(size: number): void
  /**
   * Color of the text
   * @param rgb - Color in hex format
   */
  color(rgb: string): void
  /**
   * Position of the font.
   * @param xy - Text position inside a shape.
   */
  position(xy: string | number): void
  /**
   * @param x - X Position
   * @param y - Y Position
   */
  position(x: string | number, y: string | number): void
}

export const _uStyle: _underlineStyle = <_underlineStyle>{}

_uStyle.begin = (name: string): void => {
  if (_currentStack != null) {
    throw new Error('Stack not empty, did you forget to end() ?')
  }
  if (_stack[name] != null) {
    throw new Error('Style already exists')
  }
  _currentStack = new Style(name)
  _stack[name] = _currentStack
}

_uStyle.font = (name: string): void => {
  const currentStack = ensureOpenStack()
  currentStack.font = name
}

_uStyle.size = (size: number): void => {
  const currentStack = ensureOpenStack()
  currentStack.size = size
}

_uStyle.color = (rgb: string): void => {
  const currentStack = ensureOpenStack()
  currentStack.color = rgb
}

_uStyle.position = (x: number | string, y?: number | string): void => {
  const currentStack = ensureOpenStack()
  currentStack.position = <Position<number | string>>{ x: x, y: y ?? x }
}

function ensureOpenStack(): Style {
  if (_currentStack == null) {
    throw new Error('No open stack. Did you forget to begin() ?')
  }
  return _currentStack
}
