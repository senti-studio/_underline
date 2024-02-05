import * as PIXI from 'pixi.js'
import { Area, Border, Dimensions, DisplayFlag, Position, RenderReference } from './types'

export type ContainerStack = Map<string, Container>
export type ReferenceStack = Map<string, RenderReference>

let _containerStack: ContainerStack = new Map()
// let _referenceStack: ReferenceStack = new Map()
let _currentContainer: Container | null = null

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

  constructor(public readonly name: string) {
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

let lastParent: string | null = null

export function getNameIdentifiers(identifier: string): Array<string> | null {
  identifier = identifier.replace(/\s/g, '') // Remove whitespace

  if (identifier.includes('>>')) {
    // Assign to last parent
    const currentParent = lastParent
    let id = identifier.replace(/>>/g, '') // Remove >>
    if (id.includes('!')) {
      id = id.replace(/!/g, '') // Remove !
      lastParent = id
    }

    if (currentParent == null) return null

    return [currentParent, id]
  } else if (identifier.includes('>')) {
    // Assign to given parent
    const parts = identifier.split('>')
    // Otherwise, we know that index 0 is the parent and index 1 is the child
    // If there are more > we gracefully ignore them
    return [parts[0], parts[1]]
  }

  lastParent = identifier
  return null
}

export const find = (identifier: string): Container | null => _containerStack.get(identifier) ?? null

//TODO: Use reference with resuable
/*
export const addReference = (ref: ReferenceStack): void => {
  _referenceStack = ref
}*/

export function push(container: Container): void {
  _currentContainer = container
  _containerStack.set(container.name, container)
}

export function pop(): ContainerStack {
  const current = _containerStack

  _containerStack = new Map()
  _currentContainer = null

  return current
}

export function ensureOpenStack(): Container {
  if (_currentContainer == null) {
    throw new Error('No open stack. Did you forget to begin() ?')
  }
  return _currentContainer
}
