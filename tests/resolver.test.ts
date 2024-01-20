import { expect, test } from 'vitest'
import { resolve } from '../src/resolver'
import { Border, Dimensions, Position, RenderReference } from '../src/types'
import * as PIXI from 'pixi.js'
import { ContainerStack, Container } from '../src/stacks'

const mockContainer = (): Container => {
  const stack = new Container('main')
  stack.dimensions = { w: 50, h: 50 } satisfies Dimensions<number>
  stack.position = { x: 10, y: 10 } satisfies Position<number>
  stack.border = { width: 1, color: '#fff' } satisfies Border
  stack.fill = '#fff'
  stack.text = 'Simple Test'
  return stack
}
const mockParent = (): RenderReference => {
  return {
    container: new PIXI.Container(),
    dimensions: { w: 100, h: 100 },
    position: { x: 0, y: 0 },
  } satisfies RenderReference
}

test('success: simple stack', () => {
  const container = mockContainer()
  const parent = mockParent()
  const stack = new Map()
  stack.set('main', container)
  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.size).toBe(1)
})

test('success: dimension expression', () => {
  const parent = mockParent()
  const container = mockContainer()
  container.dimensions!.w = '100%' //-> 90 (100width - 10x)
  container.dimensions!.h = '50%' //-> 50
  const stack = new Map()
  stack.set('main', container)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.get('main')?.dimensions.w).toBe(90)
  expect(resolvedStack.get('main')?.dimensions.h).toBe(50)
})
