import { Dimensions, Position, TransformType } from './types'

export function evaluateDimensions(
  ref: Dimensions<number | string>,
  parent: Dimensions<number | string>
): Dimensions<number> {
  if (typeof parent.w !== 'number' || typeof parent.h !== 'number') {
    throw new Error(`Parent stack has unresolved/invalid dimensions: ${parent.w}, ${parent.h}`)
  }

  const w = expToNumber(ref.w, parent.w as number, TransformType.Width)
  const h = expToNumber(ref.h, parent.h as number, TransformType.Height)
  return { w, h }
}

export function evaluatePosition(
  refP: Position<number | string>,
  refD: Dimensions<number | string>,
  parent: Dimensions<number | string>
): Position<number> {
  if (typeof parent.w !== 'number' || typeof parent.h !== 'number') {
    throw new Error(`Parent stack has unresolved/invalid dimensions: ${parent.w}, ${parent.h}`)
  }
  if (typeof refD.w !== 'number' || typeof refD.h !== 'number') {
    throw new Error(`Current stack has unresolved/invalid dimensions: ${refD.w}, ${refD.h}`)
  }
  let x = expToNumber(refP.x, parent.w, TransformType.X, refD.w as number)
  let y = expToNumber(refP.y, parent.h, TransformType.Y, refD.h as number)

  return { x: x, y: y }
}

function expToNumber(exp: number | string, p: number, type: TransformType, s?: number): number {
  if (typeof exp === 'number') return exp
  return evaluateExpression(exp, p, type, s)
}

function evaluateExpression(exp: string, p: number, type: TransformType, refDimension?: number) {
  let baseValue = 0
  let refValue = 0
  switch (type) {
    case TransformType.Width:
    case TransformType.X:
      baseValue = Math.round(p)
      // Only needed for x (not present in dimensional evals)
      refValue = refDimension ? Math.round(refDimension) : 0
      break
    case TransformType.Height:
    case TransformType.Y:
      baseValue = Math.round(p)
      // Only needed for y (not present in dimensional evals)
      refValue = refDimension ? Math.round(refDimension) : 0
      break
  }

  if (exp === '100%') return baseValue
  if (exp === '50%') return baseValue / 2
  if (exp === 'center') return baseValue / 2 - refValue / 2
  if (exp === 'left') return 0
  if (exp === 'right') return baseValue - refValue

  return 0
}
