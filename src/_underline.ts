import { _uBase, Area, Border, Dimensions, DisplayFlag, Position, RenderReference } from './types'
import { resolve } from './resolver'
import * as Stack from './stacks'
import { createEvent, determineSignalType, KeyFlag, MouseFlag, Signal, signalIsValid, SignalType } from './signals'
import { FederatedMouseEvent, Graphics } from 'pixi.js'

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
   * Default display is Inherit.
   * @param type - Display type of the shape, for example Flex, Absolute, ...
   * @param additional - Possibility to add an additional property for a flex container, example Inherit, Absolute
   */
  display(type: DisplayFlag, additional: DisplayFlag): void
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
  /**
   * Adds text to the shape.
   * @param text - Display text
   * @param style - _uStyle identifier
   */
  text(text: string, style?: string): void
  /**
   * Adds padding to the shape.
   * @param t - Top padding
   * @param r - Right padding
   * @param b - Bottom padding
   * @param l - Left padding
   */
  padding(t: number, r: number, b: number, l: number): void
  padding(tb: number, rl: number): void
  padding(all: number): void
  /**
   * Adds a signal event with callback.
   * @param type - Type of the signal (MouseFlag or KeyFlag)
   * @param callback - Callback function
   * @param arg - Argument for the callback function (event.data)
   */
  signal(type: SignalType, callback: Function, arg: any): void
}

export const _u: _underline = <_underline>{}

_u.renderTo = (reference: RenderReference): void => {
  // Resolve stack
  const stack = Stack.pop()
  if (stack.size === 0) return

  const resolvedStack = resolve(stack, reference)
  if (resolvedStack.size === 0) return

  // Keep reference
  // Stack.addReference(resolvedStack)
  // Draw to screen
  draw(stack, resolvedStack, reference)
  // Reset stack
  stack.clear()
}

_u.begin = (identifier: string): void => {
  const idParts = Stack.getNameIdentifiers(identifier)
  // idParts can only be null or length 2
  if (idParts == null) {
    // Push main container to stack
    Stack.push(new Stack.Container(identifier))
  } else {
    const parent = Stack.find(idParts[0])
    if (parent == null) throw new Error(`Parent container ${idParts[0]} not found`)
    // Push child to parent container
    const child = new Stack.Container(idParts[1], parent.name)
    parent.add(child)
    Stack.push(child)
  }
}

_u.signal = (types: SignalType | SignalType[], callback: Function, arg: any): void => {
  const current = Stack.ensureOpenStack()
  console.log(current.name, types)

  const isMouseType = (v: string) => Object.values(MouseFlag).includes(v as MouseFlag)
  const isKeyType = (v: string) => Object.values(KeyFlag).includes(v as KeyFlag)

  let type: MouseFlag
  let keys: KeyFlag[] = []
  if (Array.isArray(types)) {
    // Find mouse signal
    const mouseType = types.find((t: SignalType) => isMouseType(t))
    if (!mouseType) return
    type = mouseType as MouseFlag

    // Find key signals
    const keyTypes = types.filter((t: SignalType) => isKeyType(t))
    keys = keyTypes as KeyFlag[]
  } else {
    if (!isMouseType(types)) return
    type = types as MouseFlag
  }

  current.signals.push({ type: type, keys: keys, callback: callback, arg: arg } satisfies Signal)
}

_u.dimension = (w: number | string, h: number | string): void => {
  const current = Stack.ensureOpenStack()
  current.dimensions = { w: w, h: h } satisfies Dimensions<number | string>
}

_u.fill = (color: string): void => {
  const current = Stack.ensureOpenStack()
  current.fill = color
}

_u.display = (...types: DisplayFlag[]): void => {
  const current = Stack.ensureOpenStack()

  types.forEach((type: DisplayFlag) => {
    if (type === DisplayFlag.Inherit || type === DisplayFlag.Absolute) {
      current.display = type
    }
    if (
      type === DisplayFlag.FlexCol ||
      type === DisplayFlag.FlexRow ||
      type === DisplayFlag.FlexDynamic ||
      type === DisplayFlag.FlexFixed
    ) {
      current.flex.push(type)
    }
  })
}

_u.border = (width: number, color: string): void => {
  const current = Stack.ensureOpenStack()
  current.border = { width: width, color: color } satisfies Border
}

_u.position = (x: number | string, y: number | string): void => {
  const current = Stack.ensureOpenStack()
  current.position = { x: x, y: y } satisfies Position<number | string>
}

_u.text = (text: string, style?: string): void => {
  const current = Stack.ensureOpenStack()
  current.text = text
  current.textStyle = style ?? ''
}

_u.padding = (p1: number, p2?: number | null, p3?: number | null, p4?: number | null): void => {
  const current = Stack.ensureOpenStack()

  let padding = <Area>{}
  if (p3 != null && p4 != null) {
    padding.t = p1
    padding.r = p2 as number
    padding.b = p3 as number
    padding.l = p4 as number
  } else if (p2 != null) {
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

function draw(stack: Stack.ContainerStack, stackRef: Stack.ReferenceStack, parent: RenderReference): void {
  stack.forEach((c: Stack.Container) => drawContainer(c, stackRef, parent))
}

function drawContainer(current: Stack.Container, stack: Stack.ReferenceStack, parent: RenderReference): void {
  const c = current.container
  const cRef = stack.get(current.name)!
  // Begin fill
  if (current.fill != null) c.beginFill(current.fill as string)
  // Draw border
  if (current.border != null) {
    c.lineStyle(current.border!.width, current.border!.color ?? '#000')
  }

  // Draw text
  if (current.text != null) {
    c.addChild(cRef.text!)
  }
  // Draw shape
  c.drawRect(cRef.position.x, cRef.position.y, cRef.dimensions.w, cRef.dimensions.h)
  // Signal
  c.eventMode = 'none'
  if (current.signals.length > 0) {
    assignSignals(c, current)
    c.eventMode = 'static'
  }
  // Add to parent
  parent.container.addChild(c)
}

function assignSignals(c: Graphics, current: Stack.Container): void {
  // Assign each signal acording to its type
  current.signals.forEach((signal: Signal) => {
    // Assign signal
    c.on(determineSignalType(signal), (event: FederatedMouseEvent) => {
      // Only trigger callback if signal is valid
      if (signalIsValid(signal, event)) {
        // Create uEvent and trigger callback
        signal.callback(createEvent(signal.type, signal.arg))
      }
    })
  })
}
