import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest'
import * as U from '../src/_underline'
import { pop, Container, getNameIdentifiers, ensureOpenStack, find } from '../src/stacks'
import * as Stacks from '../src/stacks'
import { resolve } from '../src/resolver'
import { DisplayFlag, RenderReference } from '../src/types'

vi.mock('../src/stacks.ts', () => {
  return {
    pop: vi.fn(),
    push: vi.fn(),
    find: vi.fn(),
    Container: vi.fn(),
    getNameIdentifiers: vi.fn(),
    ensureOpenStack: vi.fn(),
  }
})
vi.mock('../src/resolver.ts', () => {
  return { resolve: vi.fn() }
})

describe('render', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  describe('success cases', () => {
    //TODO: Test all render possibilites
    test('should render', () => {
      expect(true).toBe(true)
    })
  })
  describe('failure cases', () => {
    test('returns on empty stacks', async () => {
      vi.mocked(pop).mockReturnValue(new Map())

      U._u.renderTo(<any>{})

      expect(pop).toHaveBeenCalledOnce()
      expect(pop).toReturnWith(new Map())
      expect(resolve).toHaveBeenCalledTimes(0)
    })
    test('returns on empty resolve stack', async () => {
      const stack = new Map([['id', new Container('id')]])
      vi.mocked(pop).mockReturnValue(stack)
      vi.mocked(resolve).mockReturnValue(new Map())

      U._u.renderTo(<any>{})

      expect(pop).toHaveBeenCalledOnce()
      expect(pop).toReturnWith(stack)
      expect(resolve).toHaveBeenCalledOnce()
      expect(resolve).toReturnWith(new Map())
    })
  })
})

describe('begin', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('success cases', () => {
    const successProvider = () => [
      {
        name: 'single id',
        identifier: 'id',
        idParts: null,
        find: null,
      },
      {
        name: 'id > id2',
        identifier: 'id > id2',
        idParts: ['id', 'id2'],
        find: new Container('id'),
      },
    ]
    test.each(successProvider())('$name', (provider) => {
      vi.mocked(getNameIdentifiers).mockReturnValue(provider.idParts)
      if (provider.find != null) vi.mocked(provider.find).add = vi.fn()
      vi.mocked(find).mockReturnValue(provider.find)

      U._u.begin(provider.identifier)

      expect(getNameIdentifiers).toHaveBeenCalledOnce()
      if (provider.idParts != null) {
        expect(find).toHaveBeenCalledOnce()
      }
    })
  })

  describe('error cases', () => {
    test('not found', () => {
      vi.mocked(getNameIdentifiers).mockReturnValue(['unknownParent', 'id'])
      vi.mocked(find).mockReturnValue(null)

      // prettier-ignore
      expect(() => U._u
      .begin('unknownParent > id'))
      .toThrowError('Parent container unknownParent not found')
    })
  })
})

const current = new Container('id')

test('dimension', () => {
  vi.mocked(ensureOpenStack).mockReturnValue(current)
  expect(current.dimensions).toBe(undefined)

  U._u.dimension(1, 2)
  expect(current.dimensions).toStrictEqual({ w: 1, h: 2 })
})

test('fill', () => {
  vi.mocked(ensureOpenStack).mockReturnValue(current)
  expect(current.fill).toBe(undefined)

  U._u.fill('red')
  expect(current.fill).toStrictEqual('red')
})

describe('display', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const successProvider = () => [
    {
      name: 'should set inherit',
      types: [DisplayFlag.Inherit],
      displayResult: DisplayFlag.Inherit,
      flexResult: [],
    },
    {
      name: 'should set absolute',
      types: [DisplayFlag.Absolute],
      displayResult: DisplayFlag.Absolute,
      flexResult: [],
    },
    {
      name: 'should set flex col',
      types: [DisplayFlag.FlexCol],
      displayResult: DisplayFlag.Inherit,
      flexResult: [DisplayFlag.FlexCol],
    },
    {
      name: 'should set flex row',
      types: [DisplayFlag.FlexRow, DisplayFlag.Inherit],
      displayResult: DisplayFlag.Inherit,
      flexResult: [DisplayFlag.FlexRow],
    },
    {
      name: 'should set flex dynamic',
      types: [DisplayFlag.FlexDynamic],
      displayResult: DisplayFlag.Inherit,
      flexResult: [DisplayFlag.FlexDynamic],
    },
    {
      name: 'should set flex fixed',
      types: [DisplayFlag.FlexFixed],
      displayResult: DisplayFlag.Inherit,
      flexResult: [DisplayFlag.FlexFixed],
    },
    {
      name: 'should set flex fixed and flex row',
      types: [DisplayFlag.FlexFixed, DisplayFlag.FlexRow],
      displayResult: DisplayFlag.Inherit,
      flexResult: [DisplayFlag.FlexFixed, DisplayFlag.FlexRow],
    },
  ]
  test.each(successProvider())('$name', (provider) => {
    current.display = DisplayFlag.Inherit
    current.flex = []
    vi.mocked(ensureOpenStack).mockReturnValue(current)
    expect(current.flex).toStrictEqual([])

    U._u.display(...provider.types)

    expect(current.display).toStrictEqual(provider.displayResult)
    expect(current.flex).toStrictEqual(provider.flexResult)
  })
})

test('border', () => {
  vi.mocked(ensureOpenStack).mockReturnValue(current)
  expect(current.border).toBe(undefined)

  U._u.border(1, 'red')
  expect(current.border).toStrictEqual({ width: 1, color: 'red' })
})

test('position', () => {
  vi.mocked(ensureOpenStack).mockReturnValue(current)
  expect(current.position).toBe(undefined)

  U._u.position(1, 2)
  expect(current.position).toStrictEqual({ x: 1, y: 2 })
})

describe('text', () => {
  test('should set text & style', () => {
    vi.mocked(ensureOpenStack).mockReturnValue(current)
    expect(current.text).toBe(undefined)
    expect(current.textStyle).toBe(undefined)

    U._u.text('some text', 'style class name')

    expect(current.text).toBe('some text')
    expect(current.textStyle).toBe('style class name')
  })
})

describe('padding', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

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
    const current = new Container('id')
    vi.mocked(ensureOpenStack).mockReturnValue(current)
    expect(current.padding).toBe(undefined)

    U._u.padding(provider.p1, provider.p2, provider.p3, provider.p4)
    expect(current.padding).toStrictEqual(provider.result)
  })
})
