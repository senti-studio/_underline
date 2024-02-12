import { FederatedMouseEvent } from 'pixi.js'

export enum MouseFlag {
  LeftClick = 'leftclick',
  RightClick = 'rightclick',
  Hover = 'hover',
  Leave = 'leave',
  Enter = 'enter',
}

export enum KeyFlag {
  Ctrl = 'ctrl',
  Alt = 'alt',
  Shift = 'shift',
  Esc = 'esc',
  Enter = 'enter',
  Backspace = 'backspace',
  Space = 'space',
}

export type SignalType = MouseFlag | KeyFlag

export interface Signal {
  type: SignalType
  keys: KeyFlag[]
  callback: Function
  arg: any
}

export interface uEvent {
  type: SignalType
  data: any
}

export function createEvent(type: SignalType, arg: any): uEvent {
  return { type: type, data: arg } satisfies uEvent
}

export function determineSignalType(signal: Signal): string {
  switch (signal.type) {
    case MouseFlag.Hover:
      return 'pointermove'
    case MouseFlag.Leave:
      return 'pointerout'
    case MouseFlag.Enter:
      return 'pointerover'
  }
  return 'click'
}

export function signalIsValid(signal: Signal, event: FederatedMouseEvent): boolean {
  if (signal.keys.length === 0) return true

  let result = true
  if (!event.altKey && signal.keys.includes(KeyFlag.Alt)) result = false
  if (!event.ctrlKey && signal.keys.includes(KeyFlag.Ctrl)) result = false
  if (!event.shiftKey && signal.keys.includes(KeyFlag.Shift)) result = false
  return result
}
