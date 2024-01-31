import { describe, expect, test } from 'vitest'
import * as U from '../src/_underline'
import * as Stack from '../src/stacks'
import { DisplayFlag } from '../src/types'

test('renderTo', () => {})

describe('begin', () => {
  //TODO: Mock stack getNameIdentifiers
  const successProvider = () => [
    {
      name: 'single id',
      identifier: 'id',
      result: new Stack.Container('id'),
    },
    {
      name: '>> id',
      identifier: '>> id',
      result: new Stack.Container('id'),
    },
  ]
  test.each(successProvider())('$name', (provider) => {
    U._u.begin(provider.identifier)
    const current = Stack.ensureOpenStack()
    expect(current.name).toBe(provider.result.name)
  })

  test('error: not found', () => {})
})

test('dimension', () => {
  U._u.begin('test')
  U._u.dimension(1, 2)
  const current = Stack.ensureOpenStack()
  expect(current.dimensions).toStrictEqual({ w: 1, h: 2 })
})

test('fill', () => {
  U._u.begin('test')
  U._u.fill('red')
  const current = Stack.ensureOpenStack()
  expect(current.fill).toBe('red')
})

describe('display', () => {
  const successProvider = () => [
    {
      name: 'should set inherit',
      types: DisplayFlag.Inherit,
      displayResult: DisplayFlag.Inherit,
      flexResult: null,
    },
    {
      name: 'should set absolute',
      types: DisplayFlag.Absolute,
      displayResult: DisplayFlag.Absolute,
      flexResult: null,
    },
    {
      name: 'should set flex col',
      types: DisplayFlag.FlexCol,
      displayResult: DisplayFlag.Inherit,
      flexResult: DisplayFlag.FlexCol,
    },
    {
      name: 'should set flex row',
      types: DisplayFlag.FlexRow,
      displayResult: DisplayFlag.Inherit,
      flexResult: DisplayFlag.FlexRow,
    },
    {
      name: 'should set flex dynamic',
      types: DisplayFlag.FlexDynamic,
      displayResult: DisplayFlag.Inherit,
      flexResult: DisplayFlag.FlexDynamic,
    },
    {
      name: 'should set flex fixed',
      types: DisplayFlag.FlexFixed,
      displayResult: DisplayFlag.Inherit,
      flexResult: DisplayFlag.FlexFixed,
    },
  ]
  test.each(successProvider())('$name', (provider) => {
    U._u.begin('test')
    U._u.display(provider.types)
    const current = Stack.ensureOpenStack()

    expect(current.display).toBe(provider.displayResult)
    expect(current.flex).toBe(provider.flexResult)
  })
})

test('border', () => {
  U._u.begin('test')
  U._u.border(1, 'red')
  const current = Stack.ensureOpenStack()
  expect(current.border).toStrictEqual({ width: 1, color: 'red' })
})

test('position', () => {
  U._u.begin('test')
  U._u.position(1, 2)
  const current = Stack.ensureOpenStack()
  expect(current.position).toStrictEqual({ x: 1, y: 2 })
})

describe('text', () => {
  test('should set text', () => {
    U._u.begin('test')
    U._u.text('some text')
    const current = Stack.ensureOpenStack()
    expect(current.text).toBe('some text')
    expect(current.textStyle).toBe('')
  })
  test('should set style', () => {
    U._u.begin('test')
    U._u.text('some text', 'style class name')
    const current = Stack.ensureOpenStack()
    expect(current.text).toBe('some text')
    expect(current.textStyle).toBe('style class name')
  })
})

describe('padding', () => {
  const successProvider = () => [
    {
      name: 'should set all',
      p1: 1,
      p2: 2,
      p3: 3,
      p4: 4,
      result: { t: 1, r: 2, b: 3, l: 4 },
    },
    {
      name: 'should set one',
      p1: 1,
      p2: null,
      p3: null,
      p4: null,
      result: { t: 1, r: 1, b: 1, l: 1 },
    },
    {
      name: 'should set two',
      p1: 1,
      p2: 2,
      p3: null,
      p4: null,
      result: { t: 1, r: 2, b: 1, l: 2 },
    },
    {
      name: 'should set three',
      p1: 1,
      p2: 2,
      p3: 3,
      p4: null,
      result: { t: 1, r: 2, b: 1, l: 2 },
    },
  ]
  test.each(successProvider())('$name', (provider) => {
    U._u.begin('test')
    U._u.padding(provider.p1, provider.p2, provider.p3, provider.p4)
    const current = Stack.ensureOpenStack()
    expect(current.padding).toStrictEqual(provider.result)
  })
})
