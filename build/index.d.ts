export interface AdjustConstructor {
  origin: ImageBitmap | HTMLImageElement
  mockMovePx?: number
  boundaryValue?: number
  width: number  
  height: number
}

export interface MediaValue {
  [key: string]: number[]
}

export interface MockMoveParams {
  originColorMedia: MediaValue
  leftTopPosition: number[]
  rightBottomPosition: number[]
}

export interface PickLineColorParams{
  leftTopPosition: number[]
  rightBottomPosition: number[]
  type?: string[]
  valueType?: string
}

export declare class ImageColorUtils{
  constructor(params: AdjustConstructor) 
  
  public canvas: OffscreenCanvas
  public ctx: OffscreenCanvasRenderingContext2D
  public imageData: ImageData
  
  public pickLineColor ({leftTopPosition,rightBottomPosition, type, valueType} : PickLineColorParams): MediaValue
  public leftTopMockMove ({ originColorMedia, leftTopPosition, rightBottomPosition }: MockMoveParams): number[] 
  public rightBottomMockMove ({ originColorMedia, leftTopPosition, rightBottomPosition }: MockMoveParams): number[] 

  public pickColor( x: number, y: number, type: string): number[]
  public adjust(leftTopPosition: number[], rightBottomPosition: number[]): {x: number, y: number, width: number, height: number}

  public static hex2rgb(hex: string): number[] 
  public static rgb2hex(rgb: number[]): string
  public static compare(oldVal: number[], newVal: number[],  boundaryValue: number): boolean

}