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
  valueType?: string
}

const majorityElement = function (nums: number[]) {
  let majority_element = null
  let count = 0
  for (const num of nums) {
    if (count == 0) {
      majority_element = num
    }
    if (num != majority_element) {
      count--
    } else {
      count++
    }
  }
  return majority_element
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
      ParticleSize = 2,
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

  public pickColor(x: number, y: number, type = 'rgb'): number[] {
    return type === 'rgb'
      ? ImageColorUtils.getRGB(this.imageData.data, x, y, this.canvas.width)
      : ImageColorUtils.getHSL(this.imageData.data, x, y, this.canvas.width)
  }

  // 获取四条边的中位数色值
  public pickLineColor({
    leftTopPosition,
    rightBottomPosition,
    scopes,
    valueType = 'rgb',
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
      // media[key] = ImageColorUtils.getAverage(rgbArray, valueType)
      media[key] = ImageColorUtils.getMedian(rgbArray, valueType)
    }
    return media
  }

  // 判断是否达到修正的阈值 https://stackoverflow.com/questions/9018016/how-to-compare-two-colors-for-similarity-difference
  private static isAdjust(
    oldVal: number[],
    newVal: number[],
    boundaryValue: number,
    type?: 'rgb' | 'hsv'
  ): boolean {
    const val = boundaryValue // 阈值
    let distance
    if (!type || type === 'rgb') {
      distance = Math.sqrt(
        (oldVal[0] - newVal[0]) * (oldVal[0] - newVal[0]) +
          (oldVal[1] - newVal[1]) * (oldVal[1] - newVal[1]) +
          (oldVal[2] - newVal[2]) * (oldVal[2] - newVal[2])
      )
    } else if (type === 'hsv') {
      const hsvOldVal = ImageColorUtils.rgb2hsv(oldVal)
      const hsvnewVal = ImageColorUtils.rgb2hsv(newVal)
      distance = Math.sqrt(
        (hsvOldVal[0] - hsvnewVal[0]) * (hsvOldVal[0] - hsvnewVal[0]) +
          (hsvOldVal[1] - hsvnewVal[1]) * (hsvOldVal[1] - hsvnewVal[1]) +
          (hsvOldVal[2] - hsvnewVal[2]) * (hsvOldVal[2] - hsvnewVal[2])
      )
      console.log(oldVal, newVal, distance, hsvOldVal, hsvnewVal)
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
    type?: 'hsv' | 'rgb'
  ): boolean {
    return !ImageColorUtils.isAdjust(
      oldVal,
      newVal,
      boundaryValue || ImageColorUtils.boundaryValue,
      type
    )
  }

  // 求平均值
  private static getAverage(
    data: Array<number[]>,
    valueType: string
  ): number[] {
    const total = data.reduce((x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]])
    return valueType === 'rgb'
      ? [
          Math.round(total[0] / data.length),
          Math.round(total[1] / data.length),
          Math.round(total[2] / data.length),
        ] // 返回rgb值
      : ImageColorUtils.RGB2HSL(
          Math.round(total[0] / data.length),
          Math.round(total[1] / data.length),
          Math.round(total[2] / data.length)
        ) // 返回hsl值
  }

  // 求众数
  private static getMost(data: Array<number[]>): number[] {
    const r = majorityElement(data.map((item) => item[0]))
    const g = majorityElement(data.map((item) => item[1]))
    const b = majorityElement(data.map((item) => item[2]))

    return [r, g, b]
  }

  // 求中位数
  private static getMedian(data: Array<number[]>, valueType: string): number[] {
    const total0 = data.map((item) => item[0]).sort((x, y) => (x > y ? 1 : -1))
    const total1 = data.map((item) => item[1]).sort((x, y) => (x > y ? 1 : -1))
    const total2 = data.map((item) => item[2]).sort((x, y) => (x > y ? 1 : -1))

    const length = data.length
    if (length % 2 === 0) {
      // 偶数
      const r = (total0[length / 2] + total0[length / 2 - 1]) / 2
      const g = (total1[length / 2] + total1[length / 2 - 1]) / 2
      const b = (total2[length / 2] + total2[length / 2 - 1]) / 2

      return valueType === 'rgb'
        ? [r, g, b] // 返回rgb值
        : ImageColorUtils.RGB2HSL(r, g, b) // 返回hsl值
    }
    // 奇数
    const r = total0[(length + 1) / 2]
    const g = total1[(length + 1) / 2]
    const b = total2[(length + 1) / 2]
    return valueType === 'rgb'
      ? [r, g, b] // 返回rgb值
      : ImageColorUtils.RGB2HSL(r, g, b) // 返回hsl值
  }

  // 返回某一点的hsl值
  private static getHSL(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number
  ): number[] {
    const index = (width * (y - 1) + x - 1) * 4
    const [r, g, b] = [data[index], data[index + 1], data[index + 2]]
    return ImageColorUtils.RGB2HSL(r, g, b)
  }

  // 返回某一点的rgb值
  private static getRGB(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number
  ): number[] {
    const index = (width * (y - 1) + x - 1) * 4
    const [r, g, b] = [data[index], data[index + 1], data[index + 2]]
    return [r, g, b]
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

  // rgb转hsl
  static RGB2HSL(r: number, g: number, b: number): number[] {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h
    let s
    const l = (max + min) / 2

    if (max === min) {
      h = 0
      s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return [Math.floor(h * 100), Math.round(s * 100), Math.round(l * 100)]
  }

  // hex转rgb
  static hex2rgb(hex: string): number[] {
    return [
      parseInt('0x' + hex.slice(1, 3)),
      parseInt('0x' + hex.slice(3, 5)),
      parseInt('0x' + hex.slice(5, 7)),
    ]
  }

  // RGB2HEX
  static rgb2hex(rgb: number[]): string {
    const r = rgb[0]
    const g = rgb[1]
    const b = rgb[2]
    return ((r << 16) | (g << 8) | b).toString(16)
  }

  static rgb2hsv(rgb: number[]): number[] {
    const R = rgb[0]
    const G = rgb[1]
    const B = rgb[2]
    let v: any, diff: any
    let rr, gg, bb, h, s
    const rabs = R / 255
    const gabs = G / 255
    const babs = B / 255
    ;(v = Math.max(rabs, gabs, babs)), (diff = v - Math.min(rabs, gabs, babs))
    const diffc = (c: number) => (v - c) / 6 / diff + 1 / 2
    const percentRoundFn = (num: number) => Math.round(num * 100) / 100
    if (diff == 0) {
      h = s = 0
    } else {
      s = diff / v
      rr = diffc(rabs)
      gg = diffc(gabs)
      bb = diffc(babs)

      if (rabs === v) {
        h = bb - gg
      } else if (gabs === v) {
        h = 1 / 3 + rr - bb
      } else if (babs === v) {
        h = 2 / 3 + gg - rr
      }
      if (h < 0) {
        h += 1
      } else if (h > 1) {
        h -= 1
      }
    }
    const H = Math.round(h * 360)
    const S = percentRoundFn(s * 100)
    const V = percentRoundFn(v * 100)
    return [H, S, V]
  }

  // pickColors
  pickColors(): string[] {
    console.log(' ImageColorUtils.boundaryValue', ImageColorUtils.boundaryValue)
    const similarColorsMap: { [key: string]: number[][] } = {}

    const res: number[][] = []

    // for (let x = 1; x < this.canvas.width; x += ImageColorUtils.ParticleSize) {
    //   for (
    //     let y = 1;
    //     y < this.canvas.height;
    //     y += ImageColorUtils.ParticleSize
    //   ) {
    //     const similarValues = Object.values(similarColorsMap)

    //     const rgb = ImageColorUtils.getRGB(
    //       this.imageData.data,
    //       x,
    //       y,
    //       this.canvas.width
    //     )
    //     if (!similarValues.length) {
    //       similarColorsMap[similarValues.length] = [rgb]
    //     } else if (similarValues.length) {
    //       // 是否已经被插入
    //       let insert = false
    //       for (const similarValue of similarValues) {
    //         if (
    //           ImageColorUtils.compare(
    //             rgb,
    //             similarValue[0],
    //             ImageColorUtils.boundaryValue + 0,
    //             'hsv'
    //           )
    //         ) {
    //           // similarValue.push(rgb)
    //           insert = true
    //         }
    //       }
    //       if (!insert) {
    //         similarColorsMap[similarValues.length] = [rgb]
    //       }
    //     }
    //   }
    // }

    // console.log(
    //   Object.values(similarColorsMap).sort((x, y) =>
    //     x.length < y.length ? 1 : -1
    //   )
    // )
    const values = Object.values(similarColorsMap)
    console.log(similarColorsMap)

    values
      .sort((x, y) => (x.length < y.length ? 1 : -1))
      // .filter((item) => item.length > 100)
      .forEach((item) => {
        // if(values.some(value=> ImageColorUtils.compare(value, item, 'hsv') ))
        res.push(ImageColorUtils.getMost(item))
      })

    // ImageColorUtils.getRGB(this.imageData.data, x, y, this.canvas.width)
    return res.map((item) => item.join(','))
  }
}
