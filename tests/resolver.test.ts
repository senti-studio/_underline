import { expect, test } from 'vitest'
import { resolve } from '../src/resolver'
import { Border, Dimensions, Position, RenderReference } from '../src/types'
import * as PIXI from 'pixi.js'
import { ContainerStack, Container } from '../src/stacks'
import { getStyle } from '../src/_uStyle'

const mockContainer = (): Container => {
  const stack = new Container('main')
  stack.dimensions = { w: 50, h: 50 } satisfies Dimensions<number>
  stack.position = { x: 10, y: 10 } satisfies Position<number>
  stack.border = { width: 1, color: '#fff' } satisfies Border
  stack.fill = '#fff'
  return stack
}
const mockParent = (): RenderReference => {
  return <RenderReference>{
    container: new PIXI.Graphics(),
    dimensions: { w: 100, h: 100 },
    position: { x: 0, y: 0 },
  }
}

test('simple stack', () => {
  const container = mockContainer()
  const parent = mockParent()
  const stack = new Map()
  stack.set('main', container)
  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.size).toBe(1)
})

test('resolve dimension expression', () => {
  const parent = mockParent()
  const container = mockContainer()
  container.dimensions!.w = '100%' //-> 90 (100width - 10x)
  container.dimensions!.h = '100%' //-> 90
  const stack = new Map()
  stack.set('main', container)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.get('main')?.dimensions.w).toBe(90)
  expect(resolvedStack.get('main')?.dimensions.h).toBe(90)
})

test('resolve position expression', () => {
  const parent = mockParent()
  const container = mockContainer()
  container.position!.x = 'center' //-> 25 (100width/2 - 50width/2)
  container.position!.y = 'center' //-> 25 (100height/2 - 50height/2)
  const stack = new Map()
  stack.set('main', container)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.get('main')?.position.x).toBe(25)
  expect(resolvedStack.get('main')?.position.y).toBe(25)
})

test('resolve text', () => {
  const parent = mockParent()
  const container = mockContainer()
  container.dimensions = null
  container.text = 'text'
  const stack = new Map()
  stack.set('main', container)

  const style = getStyle()
  const textStyle = new PIXI.TextStyle({
    fontFamily: style.font,
    fontSize: style.size,
    fill: style.color,
  })
  const metrics = PIXI.TextMetrics.measureText(container.text, textStyle)

  const resolvedStack = resolve(stack, parent)

  expect(resolvedStack.get('main').dimensions.w).toBe(metrics.width)
  expect(resolvedStack.get('main').dimensions.h).toBe(metrics.height)
  expect(resolvedStack.get('main').text.text).toBe(container.text)
})
