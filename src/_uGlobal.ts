import { Dimensions } from './types'

export interface _global {
  /**
   * Resolution of the application.
   */
  resolution: Dimensions<number>
}

export const _uGlobal = <_global>{}
