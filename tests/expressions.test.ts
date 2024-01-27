import { describe, expect, test } from 'vitest'
import { resolve } from '../src/resolver'
import { Border, Dimensions, DisplayFlag, Position, RenderReference } from '../src/types'
import * as PIXI from 'pixi.js'
import { ContainerStack, Container } from '../src/stacks'

describe('evaluateExpression', () => {
  describe('success cases', () => {
    test('should resolve center', () => {})
    test('should resolve left', () => {})
    test('should resolve right', () => {})
    test('should resolve 50%', () => {})
    test('should resolve 100%', () => {})
  })
  describe('failure cases', () => {
    test('should resolve to 0 in bad expression', () => {})
  })
})

describe('expToNumber', () => {
  describe('success cases', () => {
    test('should return number if number', () => {})
    test('should evaluate expression if string', () => {})
  })
})

describe('evaluatePosition', () => {
  describe('success cases', () => {
    test('should resolve position', () => {})
  })
  describe('failure cases', () => {
    test('should error on unresolved parent dimensions', () => {})
    test('should error on unresolved current dimensions', () => {})
  })
})

describe('evaluateDimensions', () => {
  describe('success cases', () => {
    test('should resolve dimensions', () => {})
  })
  describe('failure cases', () => {
    test('should error on unresolved parent dimensions', () => {})
  })
})
