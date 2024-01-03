import { DisplayFlag, Stack, DrawReference } from "./_underline"
import { TransformExpression, TransformType } from "./types"

export const evaluate = (
  tx: TransformExpression,
  ty: TransformExpression,
  tw: TransformExpression,
  th: TransformExpression,
  stack: Stack,
  p: DrawReference
): DrawReference => {
  // Evaluate dimensions first (mandatory for later steps)
  // Current stack dimensions not needed for w and h
  const emptyReference = {
    container: stack.container,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }
  let w = expToNumber(tw, TransformType.Width, emptyReference, p)
  let h = expToNumber(th, TransformType.Height, emptyReference, p)
  // Posision
  const updatedReference = emptyReference
  updatedReference.width = w
  updatedReference.height = h
  let x = expToNumber(tx, TransformType.X, updatedReference, p)
  let y = expToNumber(ty, TransformType.Y, updatedReference, p)
  // If not absolute, move object relative to its parent
  if (stack.display === DisplayFlag.Inherit) {
    x += p.x
    y += p.y
  }
  // If the dimensions are an expression like 100%, we need to consider
  // off position of x and y and subtract it from the final dimensions
  if (typeof tw !== "number") w -= x
  if (typeof th !== "number") h -= y + 5

  return {
    container: stack.container,
    width: w,
    height: h,
    x: x,
    y: y,
  }
}

const expToNumber = (
  exp: TransformExpression,
  type: TransformType,
  sd: DrawReference,
  p: DrawReference
): number => {
  if (typeof exp === "number") return exp

  return evaluateExpression(exp, type, p, sd)
}

const evaluateExpression = (
  exp: TransformExpression,
  type: TransformType,
  parent: DrawReference,
  ref: DrawReference
) => {
  let baseValue = 0
  let refValue = 0
  switch (type) {
    case TransformType.Width:
    case TransformType.X:
      baseValue = Math.round(parent.width)
      // Only needed for x
      refValue = Math.round(ref.width)
      break
    case TransformType.Height:
    case TransformType.Y:
      baseValue = Math.round(parent.height)
      // Only needed for y
      refValue = Math.round(ref.height)
  }

  if (exp === "100%") return baseValue
  if (exp === "50%") return baseValue / 2
  if (exp === "center") return baseValue / 2 - refValue / 2

  return 0
}
