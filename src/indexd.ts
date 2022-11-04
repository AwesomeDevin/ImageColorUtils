export interface LineArray {
  left: Array<[number, number]>
  top: Array<[number, number]>
  right: Array<[number, number]>
  bottom: Array<[number, number]>
  [key: string]: Array<[number, number]>
}

export type ImageData = {
  data: Uint8ClampedArray
}

export interface ICommon {
  mockMovePx?: number
  boundaryValue?: number
  ParticleSize?: number
  onload?: () => void
  type?: 'rgb' | 'lab'
  direction?: 'external' | 'internal'
}

export interface IImageBitmap {
  origin: ImageBitmap
  width: number
  height: number
}

export interface IHTMLImageElement {
  origin: HTMLImageElement
  width: number
  height: number
}

export interface IImageUrl {
  origin: string
  width?: number
  height?: number
}

export type AdjustConstructor = ICommon &
  (IImageBitmap | IHTMLImageElement | IImageUrl)

export interface MediaValue {
  [key: string]: number[]
}

export interface MockMoveParams {
  originColorMedia: MediaValue
  leftTopPosition: number[]
  rightBottomPosition: number[]
}

export interface PickLineColorParams {
  leftTopPosition: number[]
  rightBottomPosition: number[]
  scopes?: string[]
}
