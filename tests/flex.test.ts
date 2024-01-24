import { expect, test } from 'vitest'
import { resolve } from '../src/resolver'
import { Border, Dimensions, DisplayFlag, Position, RenderReference } from '../src/types'
import * as PIXI from 'pixi.js'
import { ContainerStack, Container } from '../src/stacks'
import { getStyle } from '../src/_uStyle'

const mockContainer = (): Container => {
  const stack = new Container('main')
  stack.flex = DisplayFlag.FlexRow
  stack.dimensions = { w: '100%', h: '100%' } satisfies Dimensions<number | string>
  stack.position = { x: 0, y: 0 } satisfies Position<number>
  stack.border = { width: 1, color: '#fff' } satisfies Border
  stack.fill = '#fff'
  return stack
}
const mockParent = (): RenderReference => {
  return <RenderReference>{
    container: new PIXI.Graphics(),
    dimensions: { w: 1000, h: 1000 },
    position: { x: 0, y: 0 },
  }
}

test('simple flex no childs', () => {
  const container = mockContainer()
  const parent = mockParent()
  const stack = new Map()
  stack.set('main', container)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.size).toBe(1)
})

test('simple flex dynamic children', () => {
  const container = mockContainer()
  const parent = mockParent()
  const child1 = new Container('child1')
  child1.flex = DisplayFlag.FlexDynamic
  const child2 = new Container('child2')
  child2.flex = DisplayFlag.FlexDynamic

  const stack = new Map()
  stack.set('main', container)
  stack.set('child1', child1)
  stack.set('child2', child2)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.size).toBe(3)
  expect(resolvedStack.get('child1').dimensions.w).toBe(500)
  expect(resolvedStack.get('child2').dimensions.w).toBe(500)
})

test('simple flex fixed children', () => {
  const container = mockContainer()
  const parent = mockParent()
  const child1 = new Container('child1')
  child1.flex = DisplayFlag.FlexFixed
  child1.dimensions = { w: 500, h: 500 }
  const child2 = new Container('child2')
  child2.flex = DisplayFlag.FlexFixed
  child2.dimensions = { w: 500, h: 500 }

  const stack = new Map()
  stack.set('main', container)
  stack.set('child1', child1)
  stack.set('child2', child2)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.size).toBe(3)
  expect(resolvedStack.get('child1').dimensions.w).toBe(500)
  expect(resolvedStack.get('child2').dimensions.w).toBe(500)
})
