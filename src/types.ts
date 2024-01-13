import { Container } from 'pixi.js'

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

export type RenderReference = {
  container: Container
  position: Position<number>
  dimensions: Dimensions<number>
  paddings?: Area
}

export interface _uBase {
  /**
   * Creates a new graphical objects.
   * @param name - Either use #name for a unique name, or .name for repetables
   */
  begin(name: string): void
  /**
   * Ends the current draw operation and adds all graphical objects to the parent.
   */
  end(): void
}
