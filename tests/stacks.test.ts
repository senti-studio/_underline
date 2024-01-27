import { describe, expect, test } from 'vitest'

describe('ensureOpenStack', () => {
  test('should error if no stack is open', () => {})
  test('should return the current stack', () => {})
})

describe('push', () => {
  test('should push a new stack', () => {})
})

describe('pop', () => {
  test('should pop the current stack', () => {})
})

describe('find', () => {
  test('should find a stack by name', () => {})
  test('should return null if no stack is found', () => {})
})

describe('getNameIdentifiers', () => {
  describe('success cases', () => {
    test('should return parent and child', () => {})
    test('should return parent and child with !', () => {})
  })
  describe('failure cases', () => {
    test('should return null if no parent is found', () => {})
    test('should return null if no child is found', () => {})
    test('should return null if no parent and child is found', () => {})
  })
})
