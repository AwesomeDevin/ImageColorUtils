export interface AdjustConstructor {
  leftTopPosition?: number[]
  rightBottomPosition?: number[]
  mockMovePx?: number
  boundaryValue?: number
}

export interface MediaValue {
  [key: string]: number[]
}

export interface MockMoveParams {
  originColorMedia: MediaValue
  imageData: ImageData
  width: number
}

export declare class ImageColorUtils{
  constructor(params: AdjustConstructor) 
  public compare(oldVal: number[], newVal: number[]): boolean
  public pickColor(imageData: ImageData, x: number, y: number, width: number, type: string): number[]
  public pickLineColor (imageData: ImageData, width: number, type?: string[], valueType: string): MediaValue

  public leftTopMockMove ({ originColorMedia, imageData, width }: MockMoveParams): number[]
  public rightBottomMockMove ({ originColorMedia, imageData, width }: MockMoveParams): number[]

  public adjust(img: HTMLImageElement | ImageBitmap, width: number, height: number): {x: number, y: number, width: number, height: number} 
  public hex2rgb(hex: string): number[] 
  public rgb2hex(rgb: number[]): string
}