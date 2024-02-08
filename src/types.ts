import * as PIXI from 'pixi.js'
import { Signal } from './signals'

export enum TransformType {
  Width,
  Height,
  X,
  Y,
}

export enum DisplayFlag {
  Inherit = 0,
  Absolute = 1 << 0,
  FlexRow = 2 << 0,
  FlexCol = 2 << 1,
  FlexFixed = 3 << 0,
  FlexDynamic = 3 << 1,
}

export interface RenderReference {
  name: string
  container: PIXI.Graphics
  display: DisplayFlag
  dimensions: Dimensions<number>
  position: Position<number>
  padding: Area | null
  border: Border | null
  fill: string | null
  text: PIXI.Text | null
  textStyle: PIXI.TextStyle | null
  signal: Signal | null
}
export type Border = { width: number; color: string }
export type Position<T> = {
  x: T
  y: T
}
export type Dimensions<T> = {
  w: T
  h: T
}

export type Area = {
  l: number
  r: number
  t: number
  b: number
}

export interface _uBase {
  /**
   * Creates a new graphical objects.
   * @param name - Either use #name for a unique name, or .name for repetables
   */
  begin(name: string): void
}
