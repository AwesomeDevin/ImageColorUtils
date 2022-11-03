import { rgb2lab, majorityElement, rgb2hex } from './utils'
interface LineArray {
  left: Array<[number, number]>
  top: Array<[number, number]>
  right: Array<[number, number]>
  bottom: Array<[number, number]>
  [key: string]: Array<[number, number]>
}

type ImageData = {
  data: Uint8ClampedArray
}

interface ICommon {
  mockMovePx?: number
  boundaryValue?: number
  ParticleSize?: number
  onload?: () => void
}

interface IImageBitmap {
  origin: ImageBitmap
  width: number
  height: number
}

interface IHTMLImageElement {
  origin: HTMLImageElement
  width: number
  height: number
}

interface IImageUrl {
  origin: string
  width?: number
  height?: number
}

type AdjustConstructor = ICommon &
  (IImageBitmap | IHTMLImageElement | IImageUrl)

interface MediaValue {
  [key: string]: number[]
}

interface MockMoveParams {
  originColorMedia: MediaValue
  leftTopPosition: number[]
  rightBottomPosition: number[]
}

interface PickLineColorParams {
  leftTopPosition: number[]
  rightBottomPosition: number[]
  scopes?: string[]
}

/**
 * 智能吸附步骤
 * 1. 获取左上角/右下角坐标
 * 2. 将矩形的四条边模拟为四个二维数组
 * 3. 提取二位数组对应的色值，通过求色值中位数（兼容渐变背景色）,判断该色值是否与初始色差相差较大(n)
 * 4. 模拟移动矩形的左上/右下坐标(nPX内)
 * 5. 有则对矩形的左上/右下坐标进行调整，来实现矩形四条边的修改
 */
export class ImageColorUtils {
  // private origin: ImageBitmap | HTMLImageElement
  // private lineArray: LineArray

  private static mockMovePx: number // 移动的像素
  private static boundaryValue: number // 边界值
  private static ParticleSize: number // pickupParticle
  public canvas: OffscreenCanvas
  public ctx: OffscreenRenderingContext
  public imageData: ImageData
  public onload: () => void

  // 获取四条边的数据
  constructor(params: AdjustConstructor) {
    const {
      origin,
      mockMovePx = 30,
      boundaryValue = 10,
      ParticleSize = 8,
      width,
      height,
      onload,
    } = params || {}
    if (!origin) {
      throw new Error('Origin is necessary')
    } else if (
      (origin instanceof ImageBitmap || origin instanceof HTMLImageElement) &&
      (!width || !height)
    ) {
      throw new Error(
        'Because of origin is not a http link, width and height is necessary '
      )
    }
    this.onload = onload

    ImageColorUtils.ParticleSize = ParticleSize
    ImageColorUtils.mockMovePx = mockMovePx
    ImageColorUtils.boundaryValue = boundaryValue
    this.init(origin, width, height)
      .catch((error) => {
        console.error(error)
      })
      .then(() => {
        this.onload && this.onload()
      })
  }

  private init(
    origin: string | ImageBitmap | HTMLImageElement,
    width: number,
    height: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (typeof origin === 'string') {
        // 为http链接
        const img = new Image()
        img.src = origin
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          const canvasWidth = width || img.width
          const canvasHeight = height || (canvasWidth / img.width) * img.height
          this.initCanvas(img, canvasWidth, canvasHeight)
          resolve(true)
        }
        if (img.complete) {
          const canvasWidth = width || img.width
          const canvasHeight = height || (canvasWidth / img.width) * img.height
          this.initCanvas(img, canvasWidth, canvasHeight)
          resolve(true)
        }
      } else if (origin instanceof ImageBitmap) {
        // 为ImageBitmap
        this.initCanvas(origin, width, height)
        resolve(true)
      } else if (origin instanceof HTMLImageElement) {
        // 为HTMLImageElement
        this.initCanvas(origin, width, height)
        resolve(true)
      } else {
        reject(new Error('The origin format is not supported'))
      }
    })
  }

  private initCanvas(
    img: HTMLImageElement | ImageBitmap,
    width: number,
    height: number
  ): void {
    try {
      this.canvas = new OffscreenCanvas(width, height)
      this.ctx = this.canvas.getContext('2d')
      //@ts-ignore
      this.ctx && this.ctx.drawImage(img, 0, 0, width, height)
      //@ts-ignore
      this.imageData = this.ctx && this.ctx.getImageData(0, 0, width, height)
    } catch (e) {
      throw new Error(e)
    }
  }

  public pickColor(x: number, y: number): number[] {
    return ImageColorUtils.getRGB(this.imageData.data, x, y, this.canvas.width)
  }

  // 获取四条边的中位数色值
  public pickLineColor({
    leftTopPosition,
    rightBottomPosition,
    scopes,
  }: PickLineColorParams): MediaValue {
    const data = this.imageData.data
    const media: MediaValue = {}
    const lineArrayCollection: LineArray = {
      top: this.getArrayFromTopLine(leftTopPosition, rightBottomPosition),
      left: this.getArrayFromLeftLine(leftTopPosition, rightBottomPosition),
      right: this.getArrayFromRightLine(leftTopPosition, rightBottomPosition),
      bottom: this.getArrayFromBottomLine(leftTopPosition, rightBottomPosition),
    }
    for (const key in lineArrayCollection) {
      if (scopes && !scopes.filter((item) => item === key).length) {
        continue
      }
      const lineArray: Array<number[]> = lineArrayCollection[key]
      const rgbArray: Array<number[]> = []

      for (const position of lineArray) {
        const x = position[0]
        const y = position[1]
        const [r, g, b] = ImageColorUtils.getRGB(data, x, y, this.canvas.width)
        rgbArray.push([r, g, b])
      }
      media[key] = ImageColorUtils.getMedian(rgbArray)
    }
    return media
  }

  // 判断是否达到修正的阈值 https://stackoverflow.com/questions/9018016/how-to-compare-two-colors-for-similarity-difference
  private static isAdjust(
    oldVal: number[],
    newVal: number[],
    boundaryValue: number,
    type?: 'rgb' | 'lab'
  ): boolean {
    const val = boundaryValue // 阈值
    let distance
    if (!type || type === 'rgb') {
      const [R_1, G_1, B_1] = oldVal
      const [R_2, G_2, B_2] = newVal
      const rmean = (R_1 + R_2) / 2
      const R = R_1 - R_2
      const G = G_1 - G_2
      const B = B_1 - B_2
      distance = Math.sqrt(
        (2 + rmean / 256) * R ** 2 +
          4 * G ** 2 +
          (2 + (255 - rmean) / 256) * B ** 2
      )
    } else if (type === 'lab') {
      const labOldVal = rgb2lab(oldVal)
      const labnewVal = rgb2lab(newVal)
      const [L_1, A_1, B_1] = labOldVal
      const [L_2, A_2, B_2] = labnewVal
      distance = Math.sqrt(
        Math.abs(
          Math.pow(L_1 - L_2, 2) +
            Math.pow(A_1 - A_2, 2) +
            Math.pow(B_1 - B_2, 2)
        )
      )
    }
    // const diff = (distance / Math.sqrt(360 * 360 + 100 * 100 + 100 * 100)) * 100
    if (distance >= val) {
      return true
    }
    return false
  }

  public static compare(
    oldVal: number[],
    newVal: number[],
    boundaryValue?: number,
    type?: 'lab' | 'rgb'
  ): boolean {
    return !ImageColorUtils.isAdjust(
      oldVal,
      newVal,
      boundaryValue || ImageColorUtils.boundaryValue,
      type
    )
  }

  // 求平均值
  private static getAverage(data: Array<number[]>): number[] {
    const total = data.reduce((x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]])
    return [
      Math.round(total[0] / data.length),
      Math.round(total[1] / data.length),
      Math.round(total[2] / data.length),
    ] // 返回rgb值
  }

  // 求众数
  private static getMost(data: Array<number[]>): number[] {
    const r = majorityElement(data.map((item) => item[0]))
    const g = majorityElement(data.map((item) => item[1]))
    const b = majorityElement(data.map((item) => item[2]))
    const a = majorityElement(data.map((item) => item[3]))

    return [r, g, b, a]
  }

  // 求中位数
  private static getMedian(data: Array<number[]>): number[] {
    const total0 = data.map((item) => item[0]).sort((x, y) => (x > y ? 1 : -1))
    const total1 = data.map((item) => item[1]).sort((x, y) => (x > y ? 1 : -1))
    const total2 = data.map((item) => item[2]).sort((x, y) => (x > y ? 1 : -1))

    const length = data.length
    if (length % 2 === 0) {
      // 偶数
      const r = (total0[length / 2] + total0[length / 2 - 1]) / 2
      const g = (total1[length / 2] + total1[length / 2 - 1]) / 2
      const b = (total2[length / 2] + total2[length / 2 - 1]) / 2

      return [r, g, b]
    }
    // 奇数
    const r = total0[(length + 1) / 2]
    const g = total1[(length + 1) / 2]
    const b = total2[(length + 1) / 2]
    return [r, g, b]
  }

  // 返回某一点的rgb值
  private static getRGB(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number
  ): number[] {
    const index = (width * (y - 1) + x - 1) * 4
    const [r, g, b, a] = [
      data[index],
      data[index + 1],
      data[index + 2],
      data[index + 3],
    ]
    return [r, g, b, Math.round(a / 255)]
  }

  // 上边
  private getArrayFromTopLine(
    leftTopPosition: number[],
    rightBottomPosition: number[]
  ): Array<[number, number]> {
    const result: Array<[number, number]> = []
    const leftTopX = leftTopPosition[0]
    const leftTopY = leftTopPosition[1]
    const rightBottomX = rightBottomPosition[0]
    for (let x = leftTopX; x <= rightBottomX; x++) {
      result.push([x, leftTopY])
    }
    return result
  }

  // 右边
  private getArrayFromRightLine(
    leftTopPosition: number[],
    rightBottomPosition: number[]
  ) {
    const result: Array<[number, number]> = []
    const leftTopY = leftTopPosition[1]
    const rightBottomX = rightBottomPosition[0]
    const rightBottomY = rightBottomPosition[1]
    for (let y = leftTopY; y <= rightBottomY; y++) {
      result.push([rightBottomX, y])
    }
    return result
  }

  // 下边
  private getArrayFromBottomLine(
    leftTopPosition: number[],
    rightBottomPosition: number[]
  ) {
    const result: Array<[number, number]> = []
    const leftTopX = leftTopPosition[0]
    const rightBottomX = rightBottomPosition[0]
    const rightBottomY = rightBottomPosition[1]
    for (let x = leftTopX; x <= rightBottomX; x++) {
      result.push([x, rightBottomY])
    }
    return result
  }

  // 左边
  private getArrayFromLeftLine(
    leftTopPosition: number[],
    rightBottomPosition: number[]
  ) {
    const result: Array<[number, number]> = []
    const leftTopX = leftTopPosition[0]
    const leftTopY = leftTopPosition[1]
    const rightBottomY = rightBottomPosition[1]
    for (let y = leftTopY; y <= rightBottomY; y++) {
      result.push([leftTopX, y])
    }
    return result
  }

  // 假设左上角移动
  public leftTopMockMove({
    originColorMedia,
    leftTopPosition,
    rightBottomPosition,
  }: MockMoveParams): number[] {
    const mockMovePx = ImageColorUtils.mockMovePx
    let leftTopx = leftTopPosition[0]
    let leftTopy = leftTopPosition[1]

    // 假设左上角x轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'left'
      const movePx = -count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockLeftTopx = leftTopx + movePx
      // const adjust = new ImageColorUtils({origin: this.origin , mockMovePx ,boundaryValue, width: ImageColorUtils.width, height: ImageColorUtils.height})
      const mockHslMedia = this.pickLineColor({
        leftTopPosition: [mockLeftTopx, leftTopy],
        rightBottomPosition,
        scopes: [key],
      })[key]
      if (
        ImageColorUtils.isAdjust(
          originColorMedia[key],
          mockHslMedia,
          ImageColorUtils.boundaryValue
        )
      ) {
        leftTopx = mockLeftTopx
        break
      }
    }

    // 假设左上角y轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'top'
      const movePx = -count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockLeftTopy = leftTopy + movePx
      // const adjust = new ImageColorUtils({origin: this.origin, mockMovePx, boundaryValue,  width: ImageColorUtils.width, height: ImageColorUtils.height })
      const mockHslMedia = this.pickLineColor({
        leftTopPosition: [leftTopx, mockLeftTopy],
        rightBottomPosition,
        scopes: [key],
      })[key]
      if (
        ImageColorUtils.isAdjust(
          originColorMedia[key],
          mockHslMedia,
          ImageColorUtils.boundaryValue
        )
      ) {
        leftTopy = mockLeftTopy
        break
      }
    }
    return [leftTopx, leftTopy]
  }

  // 假设右下角移动
  public rightBottomMockMove({
    originColorMedia,
    leftTopPosition,
    rightBottomPosition,
  }: MockMoveParams): number[] {
    const mockMovePx = ImageColorUtils.mockMovePx
    let rightBottomx = rightBottomPosition[0]
    let rightBottomy = rightBottomPosition[1]

    // 假设右下角x轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'right'
      const movePx = count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockRightBotttonx = rightBottomx + movePx
      // const adjust = new ImageColorUtils({origin: this.origin,  mockMovePx ,boundaryValue,width: ImageColorUtils.width, height: ImageColorUtils.height })
      const mockHslMedia = this.pickLineColor({
        leftTopPosition,
        rightBottomPosition: [mockRightBotttonx, rightBottomy],
        scopes: [key],
      })[key]
      if (
        ImageColorUtils.isAdjust(
          originColorMedia[key],
          mockHslMedia,
          ImageColorUtils.boundaryValue
        )
      ) {
        rightBottomx = mockRightBotttonx
        break
      }
    }

    // 假设右下角y轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'bottom'
      const movePx = count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockRightBottomy = rightBottomy + movePx
      // const adjust = new ImageColorUtils({origin: this.origin, mockMovePx,boundaryValue, width: ImageColorUtils.width, height: ImageColorUtils.height })
      const mockHslMedia = this.pickLineColor({
        leftTopPosition,
        rightBottomPosition: [rightBottomx, mockRightBottomy],
        scopes: [key],
      })[key]
      if (
        ImageColorUtils.isAdjust(
          originColorMedia[key],
          mockHslMedia,
          ImageColorUtils.boundaryValue
        )
      ) {
        rightBottomy = mockRightBottomy
        break
      }
    }
    return [rightBottomx, rightBottomy]
  }

  // 智能吸附后坐标
  public adjust(
    leftTopPosition: number[],
    rightBottomPosition: number[]
  ): { x: number; y: number; width: number; height: number } {
    // const params = Object.assign({origin: this.origin, width: ImageColorUtils.width, height: ImageColorUtils.height}, ImageColorUtils.mockMovePx && {mockMovePx: ImageColorUtils.mockMovePx}, ImageColorUtils.boundaryValue && {boundaryValue: ImageColorUtils.boundaryValue} )
    // const adjust = new ImageColorUtils(params)
    if (!leftTopPosition.length || !rightBottomPosition.length) {
      throw new Error('Position is invalid！')
    }
    const originColorMedia = this.pickLineColor({
      leftTopPosition,
      rightBottomPosition,
    }) // 初始rgb值
    const adjustLeftTopPosition = this.leftTopMockMove({
      originColorMedia,
      leftTopPosition,
      rightBottomPosition,
    }) // 修正后左上角坐标
    const adjustRightBottomPosition = this.rightBottomMockMove({
      originColorMedia,
      leftTopPosition,
      rightBottomPosition,
    }) // 修正后右下角坐标
    const adjustWidth = adjustRightBottomPosition[0] - adjustLeftTopPosition[0] // 修正后width
    const adjustHeight = adjustRightBottomPosition[1] - adjustLeftTopPosition[1] // 修正后height

    const x = adjustLeftTopPosition[0]
    const y = adjustLeftTopPosition[1]

    return {
      x,
      y,
      width: adjustWidth,
      height: adjustHeight,
    }
  }

  // pickColors
  pickColors(): {
    rgb: string[]
    hex: string[]
  } {
    const similarColorsMap: { [key: string]: number[][] } = {}

    const res: number[][] = []
    const boundaryValue = 25
    const type = 'lab'

    let lastColor

    for (let x = 1; x < this.canvas.width; x += ImageColorUtils.ParticleSize) {
      for (
        let y = 1;
        y < this.canvas.height;
        y += ImageColorUtils.ParticleSize
      ) {
        const similarValues = Object.values(similarColorsMap)

        const rgba = ImageColorUtils.getRGB(
          this.imageData.data,
          x,
          y,
          this.canvas.width
        )
        lastColor = rgba
        if (rgba[3] === 0) {
          continue
        } else if (!similarValues.length) {
          similarColorsMap[similarValues.length] = [rgba]
        } else if (
          similarValues.length &&
          lastColor &&
          ImageColorUtils.compare(
            rgba,
            lastColor,
            ImageColorUtils.boundaryValue,
            type
          )
        ) {
          // 是否已经被插入
          let insert = false
          for (const similarValue of similarValues) {
            if (
              ImageColorUtils.compare(
                rgba,
                similarValue[similarValue.length - 1],
                boundaryValue,
                type
              ) &&
              ImageColorUtils.compare(
                rgba,
                similarValue[Math.floor(similarValue.length / 2)],
                boundaryValue,
                type
              )
            ) {
              similarValue.push(rgba)
              insert = true
            }
          }
          if (!insert) {
            similarColorsMap[similarValues.length] = [rgba]
          }
        }
      }
    }

    const values = Object.values(similarColorsMap)
    values
      .sort((x, y) => (x.length < y.length ? 1 : -1))
      .filter((item) => item.length > 5)
      .forEach((item) => {
        if (
          !res.some((value) =>
            ImageColorUtils.compare(
              value,
              ImageColorUtils.getMedian(item),
              boundaryValue,
              type
            )
          )
        ) {
          res.push(ImageColorUtils.getMedian(item))
        }
      })

    return {
      rgb: res.map((item) => `rgba(${item.join(',')})`),
      hex: res.map((item) => rgb2hex(item)),
    }
  }
}
