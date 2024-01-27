import { describe, expect, test } from 'vitest'
import { resolve } from '../src/resolver'
import { Border, Dimensions, Position, RenderReference } from '../src/types'
import { Container } from '../src/stacks'
import { getStyle } from '../src/_uStyle'
import * as PIXI from 'pixi.js'

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
    test('should resolve dimensions', () => {})
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
  describe('success cases', () => {
    test('should resolve', () => {})
  })
})
