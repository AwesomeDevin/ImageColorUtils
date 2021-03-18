interface AdjustConstructor {
  leftTopPosition?: number[]
  rightBottomPosition?: number[]
  mockMovePx?: number
  boundaryValue?: number
}

declare class ImageColorUtils{
  constructor(params: AdjustConstructor) 
  public compare(oldVal: number[], newVal: number[]): boolean
  public pickColor(imageData: ImageData, x: number, y: number, width: number, type = 'rgb'): number[]
  public adjust(imageData: ImageData, width: number ): {x: number, y: number, width: number, height: number} 
  public hex2rgb(hex: string): number[] 
  public rgb2hex(rgb: number[]): string
}