import { describe, expect, test, vi } from 'vitest'
import * as Stack from '../src/stacks'

const container = new Stack.Container('test')

describe('push & pop & find', () => {
  test('should push a new stack', () => {
    Stack.push(container)
  })

  test('should have open stack', () => {
    expect(Stack.ensureOpenStack()).toStrictEqual(container)
  })

  test('should find test container', () => {
    const found = Stack.find('test')
    expect(found).toStrictEqual(container)
  })

  test('should pop stack with test container', () => {
    const pop = Stack.pop()
    expect(pop.get('test')).toStrictEqual(container)
  })

  test('should throw error on empty stack', () => {
    expect(() => Stack.ensureOpenStack()).toThrowError('No open stack. Did you forget to begin() ?')
  })

  test('should not find test container', () => {
    const notFound = Stack.find('test')
    expect(notFound).toBeNull()
  })
})

describe('getNameIdentifiers', () => {
  describe('success cases', () => {
    test('should return parent and child', () => {
      const result = Stack.getNameIdentifiers('parent > child')
      expect(result).toStrictEqual(['parent', 'child'])
    })
    test('should return parent and child quick mode', () => {
      Stack.getNameIdentifiers('parent')
      const result = Stack.getNameIdentifiers('>> child')
      expect(result).toStrictEqual(['parent', 'child'])
    })
    test('should return parent and child with ! quick mode', () => {
      Stack.getNameIdentifiers('parent')
      const result = Stack.getNameIdentifiers('>> child!')
      expect(result).toStrictEqual(['parent', 'child'])
    })
  })
  describe('failure cases', () => {
    test('should return null if no parent is found', () => {})
    test('should return null if no child is found', () => {})
    test('should return null if no parent and child is found', () => {})
  })
})
