interface CanvasConstructor{
  src: string
  width: number
  height: number
}

type Result = {ctx: OffscreenCanvasRenderingContext2D, imageData: ImageData, imageBitMap: ImageBitmap, width: number, height: number}

export class ImageColorCanvas {

  static src: string
  static width: number

  constructor (params: CanvasConstructor) {
    const { src, width } = params
    ImageColorCanvas.src = src
    ImageColorCanvas.width = width
  }

  public init(): Promise<Result> {
    return ImageColorCanvas.initImage()
  }

  static initImage(): Promise<Result> {
    return new Promise((resolve, reject)=>{
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const width = ImageColorCanvas.width || img.width
        const height = ImageColorCanvas.width ? (ImageColorCanvas.width / img.width) * img.height : img.height
        ImageColorCanvas.initCanvas(img, width, height).then(res=>{
          resolve(res)
        }).catch(err=>{
          reject(err)
        })
      }
      img.src = this.src
    })
  }

  static async initCanvas(img: HTMLImageElement,width: number, height: number): Promise<Result> {
    const offscreen = new OffscreenCanvas(width, height)
    const ctx = offscreen.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const imageBitMap = await createImageBitmap(offscreen, 0, 0, width, height)
    return {
      ctx,
      imageData,
      imageBitMap,
      width,
      height
    }
  }
}