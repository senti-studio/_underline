export enum TransformType {
  Width,
  Height,
  X,
  Y,
}

export type TransformExpression = number | string
export type TinyRect = { w: TransformExpression; h: TransformExpression }
export type TinyBorder = { width: number; color: string }
export type TinyPosition = { x: TransformExpression; y: TransformExpression }
export type Dimensions = { x: number; y: number; w: number; h: number }
