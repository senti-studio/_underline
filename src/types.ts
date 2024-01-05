import { Container } from "pixi.js"

export enum TransformType {
  Width,
  Height,
  X,
  Y,
}

export type ValueExpression = string
export type Border = { width: number; color: string }
export type Position = {
  x: number | ValueExpression
  y: number | ValueExpression
}
export type Dimensions = {
  w: number | ValueExpression
  h: number | ValueExpression
}

export type DrawReference = {
  container: Container
  position: Position
  dimensions: Dimensions
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
