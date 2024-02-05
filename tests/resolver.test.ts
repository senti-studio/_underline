import { describe, expect, test } from 'vitest'
import { resolve, resolveNEW } from '../src/resolver'
import { Border, Dimensions, DisplayFlag, Position, RenderReference } from '../src/types'
import { Container } from '../src/stacks'
import { getStyle } from '../src/_uStyle'
import * as PIXI from 'pixi.js'
import { _uGlobal } from '../src/_uGlobal'

describe('resolveFlex', () => {
  describe('success cases', () => {
    test('should resolve flex', () => {})
    // TODO: each possible flex outcomes
  })
  describe('failure cases', () => {
    test('should error on unresolved parent dimensions', () => {})
    test('should error on unresolved current dimensions', () => {})
  })
})

test('resolveTextStyle', () => {})

test('resolveText', () => {})

describe('resolvePosition', () => {
  describe('success cases', () => {
    test('should resolve position', () => {})
    // TODO: each possible position outcomes
  })
  describe('failure cases', () => {
    test('should error on weird display flag', () => {})
  })
})

describe('resolveDimensions', () => {
  describe('success cases', () => {
    const parent = <Dimensions<number>>{ w: 500, h: 500 }
    const successProvider = () => [
      {
        name: 'absolute with dimensions',
        display: DisplayFlag.Absolute,
        dimensions: { w: 25, h: 25 },
        expected: { w: 25, h: 25 },
      },
      {
        name: 'absolute np dimensions',
        display: DisplayFlag.Absolute,
        dimensions: null,
        expected: { w: 0, h: 0 },
      },
    ]
    test.each(successProvider())('$name', (provider) => {
      const container = new Container('test')
      // expect(resolveDimensions(container, parent).toStrictEqual(provider.expected)
    })
    // TODO: each possible dimensions outcomes
  })
  describe('failure cases', () => {
    test('should error on weird display flag', () => {})
  })
})

describe('resolveContainer', () => {
  describe('success cases', () => {
    test('should resolve container', () => {})
  })
})

describe('resolve', () => {
  _uGlobal.resolution = { w: 1000, h: 1000 }
  const parent = <RenderReference>{
    dimensions: <Dimensions<number>>{ w: 500, h: 500 },
    position: <Position<number>>{ x: 0, y: 0 },
  }
  //prettier-ignore
  const main = new Container('main')
  const child1 = new Container('child1')
  child1.display = DisplayFlag.Absolute
  child1.dimensions = <Dimensions<number>>{ w: 25, h: 25 }
  child1.position = <Position<number>>{ x: 10, y: 15 }
  const flex = new Container('flex1')
  flex.flex = DisplayFlag.FlexRow
  const flexchild1 = new Container('flexchild1')
  flexchild1.flex = DisplayFlag.FlexFixed
  flexchild1.dimensions = <Dimensions<number>>{ w: 100, h: 100 }
  const flexchild2 = new Container('flexchild2')
  flexchild2.flex = DisplayFlag.FlexDynamic
  const flexchild3 = new Container('flexchild3')
  flexchild3.flex = DisplayFlag.FlexDynamic

  flex.add(flexchild1)
  flex.add(flexchild2)
  flex.add(flexchild3)
  main.add(child1)
  main.add(flex)

  const stack = new Map([
    ['main', main],
    ['child1', child1],
    ['flex1', flex],
    ['flexchild1', flexchild1],
    ['flexchild2', flexchild2],
    ['child3', flexchild3],
  ])

  test('should resolve', () => {
    const result = resolve(stack, parent)
    expect(result.size).toStrictEqual(6)

    expect(result.get('main')!.dimensions).toStrictEqual({ w: 500, h: 500 })
    expect(result.get('main')!.position).toStrictEqual({ x: 0, y: 0 })
    expect(result.get('main')!.name).toStrictEqual('main')
    expect(result.get('main')!.display).toStrictEqual(DisplayFlag.Inherit)

    expect(result.get('child1')!.dimensions).toStrictEqual({ w: 25, h: 25 })
    expect(result.get('child1')!.position).toStrictEqual({ x: 10, y: 15 })
    expect(result.get('child1')!.name).toStrictEqual('child1')
    expect(result.get('child1')!.display).toStrictEqual(DisplayFlag.Absolute)
  })
})
