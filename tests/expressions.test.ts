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
      {
        name: 'resolve left',
        refD: refD,
        parent: parent,
        refP: <Position<string | number>>{ x: 'left', y: 0 },
        result: <Position<number>>{ x: 0, y: 0 },
      },
      {
        name: 'resolve unknown expression',
        refD: refD,
        parent: parent,
        refP: <Position<string | number>>{ x: 'something', y: 0 },
        result: <Position<number>>{ x: 0, y: 0 },
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
    test('should error on unresolved parent dimensions', () => {
      const parent = <Dimensions<string>>{ w: '100%', h: '100%' }
      const refD = <Dimensions<number>>{ w: 50, h: 50 }
      const refP = <Position<string>>{ x: 'center', y: 'center' }
      expect(() => {
        Expressions.evaluatePosition(refP, refD, parent)
      }).toThrow('Parent stack has unresolved/invalid dimensions: 100%, 100%')
    })
    test('should error on unresolved current dimensions', () => {
      const parent = <Dimensions<number>>{ w: 100, h: 100 }
      const refD = <Dimensions<string>>{ w: '50%', h: '50%' }
      const refP = <Position<string>>{ x: 'center', y: 'center' }
      expect(() => {
        Expressions.evaluatePosition(refP, refD, parent)
      }).toThrow('Current stack has unresolved/invalid dimensions: 50%, 50%')
    })
  })
})

describe('evaluateDimensions', () => {
  describe('success cases', () => {
    const parent = <Dimensions<number>>{ w: 100, h: 100 }
    const refP = <Position<string>>{ x: 'left', y: 'center' }
    const successProiver = () => [
      {
        name: 'resolve 100%',
        refP: refP,
        parent: parent,
        refD: <Dimensions<string>>{ w: '100%', h: '100%' },
        result: <Dimensions<number>>{ w: 100, h: 100 },
      },
      {
        name: 'resolve 50%',
        refP: refP,
        parent: parent,
        refD: <Dimensions<string>>{ w: '50%', h: '50%' },
        result: <Dimensions<number>>{ w: 50, h: 50 },
      },
    ]
    test.each(successProiver())('$name', (provider) => {
      expect(Expressions.evaluateDimensions(provider.refD, provider.parent)).toStrictEqual(provider.result)
    })
  })
  describe('failure cases', () => {
    test('should error on unresolved parent dimensions', () => {
      const parent = <Dimensions<string>>{ w: '100%', h: '100%' }
      const refD = <Dimensions<string>>{ w: '50%', h: '50%' }
      expect(() => {
        Expressions.evaluateDimensions(refD, parent)
      }).toThrow('Parent stack has unresolved/invalid dimensions: 100%, 100%')
    })
  })
})
