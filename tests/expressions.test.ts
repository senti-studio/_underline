import { describe, expect, test, vi } from 'vitest'
import * as Expressions from '../src/expressions'
import { Border, Dimensions, DisplayFlag, Position, RenderReference, TransformType } from '../src/types'

describe('expToNumber', () => {
  describe('success cases', () => {
    test('should return number if number', () => {})
    test('should evaluate expression if string', () => {})
  })
})

describe('evaluatePosition', () => {
  describe('success cases', () => {
    const parent = <Dimensions<number>>{ w: 100, h: 100 }
    const refD = <Dimensions<number>>{ w: 50, h: 50 }
    const successProiver = () => [
      {
        name: 'resolve center',
        refD: refD,
        parent: parent,
        refP: <Position<string>>{ x: 'center', y: 'center' },
        result: <Position<number>>{ x: 25, y: 25 },
      },
      {
        name: 'resolve right',
        refD: refD,
        parent: parent,
        refP: <Position<string>>{ x: 'right', y: 'right' },
        result: <Position<number>>{ x: 50, y: 50 },
      },
    ]

    test.each(successProiver())('$name', (provider) => {
      //prettier-ignore
      expect(Expressions 
        .evaluatePosition(provider.refP, provider.refD, provider.parent))
        .toStrictEqual(provider.result)
    })
  })
  describe('failure cases', () => {
    test('should error on unresolved parent dimensions', () => {})
    test('should error on unresolved current dimensions', () => {})
  })
})

describe('evaluateDimensions', () => {
  describe('success cases', () => {
    test('should resolve 50%', () => {})
    test('should resolve 100%', () => {})
    test('should resolve dimensions', () => {})
  })
  describe('failure cases', () => {
    test('should error on unresolved parent dimensions', () => {})
  })
})
