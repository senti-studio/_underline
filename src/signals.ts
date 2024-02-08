export enum MouseFlag {
  Left = 0,
  Right = 1,
  Middle = 2,
}

export enum KeyFlag {
  Ctrl = 0,
  Alt = 1,
  Shift = 2,
  Esc = 3,
  Enter = 4,
  Backspace = 5,
  Space = 6,
}

export type SignalType = MouseFlag | KeyFlag

export interface Signal {
  type: SignalType
  callback: Function
  arg: any
}

export interface uEvent {
  type: SignalType
  data: any
}

export function makeEvent(type: SignalType, arg: any): uEvent {
  return { type: type, data: arg } satisfies uEvent
}