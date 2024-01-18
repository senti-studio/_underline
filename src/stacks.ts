import * as PIXI from 'pixi.js'
import { Area, Border, Dimensions, DisplayFlag, Position } from './types'

export type ContainerStack = Map<string, Container>
export type ReferenceStack = Map<string, ContainerReference>

const _containerStack: ContainerStack = new Map()
let _referenceStack: ReferenceStack = new Map()
let _currentContainer: Container | null = null

export interface ContainerReference {
  name: string
  container: PIXI.Graphics
  display: DisplayFlag
  dimensions: Dimensions<number>
  position: Position<number>
  border: Border | null
  padding: Area | null
  fill: string | null
  text: PIXI.Text | null
  textStyle: PIXI.TextStyle | null
}

export class Container {
  public readonly container: PIXI.Graphics = new PIXI.Graphics()
  public display: DisplayFlag = DisplayFlag.Inherit
  public flex: DisplayFlag | null = null
  public dimensions: Dimensions<number | string> | null = null
  public border: Border | null = null
  public position: Position<number | string> | null = null
  public padding: Area | null = null
  public fill: string | null = null
  public text: string | null = null
  public textStyle: string | null = null

  constructor(
    public readonly name: string,
    public readonly parent?: Container
  ) {
    this.container.name = name
  }

  private _children: Array<Container> = []
  get children(): Array<Container> {
    return this._children
  }

  public add(child: Container): void {
    this._children.push(child)
  }

  public isFlex(): boolean {
    if (this.flex != null) {
      return true
    }
    if (this.display === DisplayFlag.FlexCol || this.display === DisplayFlag.FlexRow) {
      return true
    }
    return false
  }

  public hasExpressions(transform: Position<number | string> | Dimensions<number | string>): boolean {
    let position: Position<number | string> | string | null = null
    let dimensions: Dimensions<number | string> | string | null = null
    if ((transform as Position<number | string>).x != null) {
      position = transform as Position<number | string>
    } else {
      dimensions = transform as Dimensions<number | string>
    }
    // Finx expression
    if (position != null) {
      if (typeof position.x === 'string') return true
      if (typeof position.y === 'string') return true
    } else if (dimensions != null) {
      if (typeof dimensions.w === 'string') return true
      if (typeof dimensions.h === 'string') return true
    }
    return false
  }
}

export const determineParent = (identifier: string): Array<string> | null => {
  identifier = identifier.replace(/\s/g, '') // Remove whitespace
  // Parse identifier string and split into parts based on > character
  const parts = identifier.split('>')
  // If there is only one part, then the parent is null
  // Which makes this the root container
  if (parts.length === 1) {
    return null
  }
  // Otherwise, we know that index 0 is the parent and index 1 is the child
  // If there are more > we gracefully ignore them
  return [parts[0], parts[1]]
}

export const push = (stack: Container): void => {
  _currentContainer = stack
  _containerStack.set(stack.name, stack)
}

export const find = (identifier: string): Container | null => {
  return _containerStack.get(identifier) ?? null
}

export const addReference = (ref: ReferenceStack): void => {
  _referenceStack = ref
}

export const pop = (): ContainerStack => {
  _currentContainer = null
  return _containerStack
}

export const ensureOpenStack = (): Container => {
  if (_currentContainer == null) {
    throw new Error('No open stack. Did you forget to begin() ?')
  }
  return _currentContainer
}
