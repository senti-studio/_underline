import { expect, test } from "vitest"
import { resolve } from "../src/resolver"
import { Stack } from "../src/_underline"
import { Border, Dimensions, DrawReference, Position } from "../src/types"
import * as PIXI from "pixi.js"

const mockStack = (): Stack => {
  const stack = new Stack("#main")
  stack.dimensions = { w: 50, h: 50 } satisfies Dimensions
  stack.position = { x: 10, y: 10 } satisfies Position
  stack.border = { width: 1, color: "#fff" } satisfies Border
  stack.fill = "#fff"
  stack.text = "Simple Test"
  return stack
}
const mockParent = (): DrawReference => {
  return {
    container: new PIXI.Container(),
    dimensions: { w: 100, h: 100 },
    position: { x: 0, y: 0 },
  } satisfies DrawReference
}

test("success: simple stack", () => {
  const stack = mockStack()
  const parent = mockParent()
  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack).toBe(stack)
})

test("success: dimension expression", () => {
  const parent = mockParent()
  const stack = mockStack()
  stack.dimensions!.w = "100%"
  stack.dimensions!.h = "50%"

  console.log(stack.dimensions)
  const resolvedStack = resolve(stack, parent)

  console.log(resolvedStack.dimensions)
  expect(resolvedStack).toBe(stack)
})
