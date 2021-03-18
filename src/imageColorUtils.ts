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

// interface Adjust {
//   // pickLineColor(type: string, width: number): void
//   // leftTopPosition: number[]
// }

interface AdjustConstructor {
  leftTopPosition?: number[]
  rightBottomPosition?: number[]
  mockMovePx?: number
  boundaryValue?: number
}

interface MediaValue {
  [key: string]: number[]
}

interface MockMoveParams {
  originColorMedia: MediaValue
  imageData: ImageData
  width: number
}

/**
 * 智能吸附步骤
 * 1. 获取左上角/右下角坐标
 * 2. 将矩形的四条边模拟为四个二维数组
 * 3. 提取二位数组对应的色值，通过求色值中位数,判断该色值是否与初始色差相差较大(n)
 * 4. 模拟移动矩形的左上/右下坐标(nPX内)
 * 5. 有则对矩形的左上/右下坐标进行调整，来实现矩形四条边的修改
 */
export class ImageColorUtils {
  leftTopPosition: number[]  // 左上角坐标
  rightBottomPosition: number[] // 右下角坐标
  mockMovePx: number  // 移动的像素
  boundaryValue: number  // 边界值
  lineArray: LineArray

  // 获取四条边的数据
  constructor (params: AdjustConstructor) {
    const { leftTopPosition = [0,0], rightBottomPosition = [1,1], mockMovePx = 30, boundaryValue = 10} = params || {}
    this.leftTopPosition = leftTopPosition 
    this.rightBottomPosition = rightBottomPosition
    this.mockMovePx = mockMovePx 

    this.boundaryValue = boundaryValue 
    this.lineArray = {
      top: this.getArrayFromTopLine(),
      left: this.getArrayFromLeftLine(),
      right: this.getArrayFromRightLine(),
      bottom: this.getArrayFromBottomLine(),
    }
  }

  public pickColor(imageData: ImageData, x: number, y: number, width: number, type = 'rgb'): number[] {
    return type === 'rgb' ? ImageColorUtils.getRGB(imageData.data, x, y, width) : ImageColorUtils.getHSL(imageData.data, x, y, width)
  }

  // 获取四条边的中位数色值
  public pickLineColor (imageData: ImageData, width: number, type?: string[], valueType = 'rgb'): MediaValue {
    const data = imageData.data
    const media: MediaValue = {}
    for (const key in this.lineArray) {
      if (type && !type.filter(item=>item===key).length) {
        continue
      }
      const lineArray: Array<number[]> = this.lineArray[key]
      const rgbArray: Array<number[]> = []

      for (const position of lineArray) {
        const x = position[0]
        const y = position[1]
        const [r, g, b] = ImageColorUtils.getRGB(data, x, y, width)
        rgbArray.push([r, g, b])
      }
      // media[key] = ImageColorUtils.getAverage(rgbArray, valueType)
      media[key] = ImageColorUtils.getMedian(rgbArray, valueType)
    }
    return media
  }

  // 判断是否达到修正的阈值
  static isAdjust (oldVal: number[], newVal: number[], boundaryValue: number): boolean {
    const val = boundaryValue // 阈值
    const diffH = Math.abs(oldVal[0] - newVal[0])
    const diffS = Math.abs(oldVal[1] - newVal[1])
    const diffL = Math.abs(oldVal[2] - newVal[2])

    if (diffH >= val || diffL >= val || diffS >= val) {
      return true
    }
    return false
  }


  public compare(oldVal: number[], newVal: number[]): boolean {
    return !ImageColorUtils.isAdjust(oldVal, newVal, this.boundaryValue)
  }

  // 求平均值
  static getAverage (data: Array<number[]>, valueType: string): number[] {
    const total = data.reduce((x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]])
    return valueType === 'rgb' ?
      [Math.round(total[0] / data.length), Math.round(total[1] / data.length), Math.round(total[2] / data.length)] // 返回rgb值
      :
      ImageColorUtils.RGB2HSL(Math.round(total[0] / data.length), Math.round(total[1] / data.length), Math.round(total[2] / data.length)) // 返回hsl值
  }

  // 求中位数
  static getMedian (data: Array<number[]>, valueType: string): number[] {
    const total0 = data.map(item => item[0]).sort((x, y) => (x > y ? 1 : -1))
    const total1 = data.map(item => item[1]).sort((x, y) => (x > y ? 1 : -1))
    const total2 = data.map(item => item[2]).sort((x, y) => (x > y ? 1 : -1))

    const length = data.length
    if (length % 2 === 0) {
      // 偶数
      const r = (total0[length / 2] + total0[(length / 2) - 1]) / 2
      const g = (total1[length / 2] + total1[(length / 2) - 1]) / 2
      const b = (total2[length / 2] + total2[(length / 2) - 1]) / 2

      return valueType === 'rgb' ?
        [r, g, b] // 返回rgb值
        :
        ImageColorUtils.RGB2HSL(r, g, b) // 返回hsl值
    }
    // 奇数
    const r = total0[(length + 1) / 2]
    const g = total1[(length + 1) / 2]
    const b = total2[(length + 1) / 2]
    return valueType === 'rgb' ?
      [r, g, b] // 返回rgb值
      :
      ImageColorUtils.RGB2HSL(r, g, b) // 返回hsl值
  }

  // 返回某一点的hsl值
  static getHSL (data: Uint8ClampedArray, x: number, y: number, width: number): number[] {
    const index = (((width * (y - 1)) + x - 1) * 4)
    const [r, g, b] = [
      data[index],
      data[index + 1],
      data[index + 2]
    ]
    return ImageColorUtils.RGB2HSL(r, g, b)
  }

  // 返回某一点的rgb值
  static getRGB (data: Uint8ClampedArray, x: number, y: number, width: number): number[] {
    const index = (((width * (y - 1)) + x - 1) * 4)
    const [r, g, b] = [
      data[index],
      data[index + 1],
      data[index + 2]
    ]
    return [r, g, b]
  }


  // 上边
  private getArrayFromTopLine (): Array<[number, number]> {
    const result: Array<[number, number]> = []
    const leftTopX = this.leftTopPosition[0]
    const leftTopY = this.leftTopPosition[1]
    const rightBottomX = this.rightBottomPosition[0]
    for (let x = leftTopX; x <= rightBottomX; x++) {
      result.push([x, leftTopY])
    }
    return result
  }

  // 右边
  private getArrayFromRightLine () {
    const result: Array<[number, number]> = []
    const leftTopY = this.leftTopPosition[1]
    const rightBottomX = this.rightBottomPosition[0]
    const rightBottomY = this.rightBottomPosition[1]
    for (let y = leftTopY; y <= rightBottomY; y++) {
      result.push([rightBottomX, y])
    }
    return result
  }

  // 下边
  private getArrayFromBottomLine () {
    const result: Array<[number, number]> = []
    const leftTopX = this.leftTopPosition[0]
    const rightBottomX = this.rightBottomPosition[0]
    const rightBottomY = this.rightBottomPosition[1]
    for (let x = leftTopX; x <= rightBottomX; x++) {
      result.push([x, rightBottomY])
    }
    return result
  }


  // 左边
  private getArrayFromLeftLine () {
    const result: Array<[number, number]> = []
    const leftTopX = this.leftTopPosition[0]
    const leftTopY = this.leftTopPosition[1]
    const rightBottomY = this.rightBottomPosition[1]
    for (let y = leftTopY; y <= rightBottomY; y++) {
      result.push([leftTopX, y])
    }
    return result
  }

  // 假设左上角移动
  public leftTopMockMove ({ originColorMedia, imageData, width }: MockMoveParams): number[] {
    const mockMovePx = this.mockMovePx
    let leftTopx = this.leftTopPosition[0]
    let leftTopy = this.leftTopPosition[1]

    // 假设左上角x轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'left'
      const movePx = -count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockLeftTopx = leftTopx + movePx
      const adjust = new ImageColorUtils({ leftTopPosition: [mockLeftTopx, leftTopy], rightBottomPosition: this.rightBottomPosition, mockMovePx: this.mockMovePx })
      const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key]
      if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
        leftTopx = mockLeftTopx
        break
      }
    }

    // 假设左上角y轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'top'
      const movePx = -count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockLeftTopy = leftTopy + movePx
      const adjust = new ImageColorUtils({ leftTopPosition: [leftTopx, mockLeftTopy], rightBottomPosition: this.rightBottomPosition, mockMovePx: this.mockMovePx })
      const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key]

      if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
        leftTopy = mockLeftTopy
        break
      }
    }
    return [leftTopx, leftTopy]
  }

  // 假设右下角移动
  public rightBottomMockMove ({ originColorMedia, imageData, width }: MockMoveParams): number[] {
    const mockMovePx = this.mockMovePx
    let rightBottomx = this.rightBottomPosition[0]
    let rightBottomy = this.rightBottomPosition[1]

    // 假设右下角x轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'right'
      const movePx = count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockRightBotttonx = rightBottomx + movePx
      const adjust = new ImageColorUtils({ leftTopPosition: this.leftTopPosition, rightBottomPosition: [mockRightBotttonx, rightBottomy], mockMovePx: this.mockMovePx })
      const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key]
      if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
        rightBottomx = mockRightBotttonx
        break
      }
    }

    // 假设右下角y轴向 +mockMovePx/2 ~ -mockMovePx/2 内移动
    for (let count = 1; count <= mockMovePx; count++) {
      const key = 'bottom'
      const movePx = count // +mockMovePx/2-1 ~ -mockMovePx/2 内移动
      const mockRightBottomy = rightBottomy + movePx
      const adjust = new ImageColorUtils({ leftTopPosition: this.leftTopPosition, rightBottomPosition: [rightBottomx, mockRightBottomy], mockMovePx: this.mockMovePx })
      const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key]
      if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
        rightBottomy = mockRightBottomy
        break
      }
    }
    return [rightBottomx, rightBottomy]
  }


  // 智能吸附后坐标
  public adjust(imageData: ImageData, width: number ): {x: number, y: number, width: number, height: number} {
    const params = Object.assign({ leftTopPosition: this.leftTopPosition, rightBottomPosition: this.rightBottomPosition}, this.mockMovePx && {mockMovePx: this.mockMovePx}, this.boundaryValue && {boundaryValue: this.boundaryValue} )
    const adjust = new ImageColorUtils(params)
    const originColorMedia = adjust.pickLineColor(imageData, width) // 初始rgb值
    const adjustLeftTopPosition = adjust.leftTopMockMove({ originColorMedia, imageData, width }) // 修正后左上角坐标
    const adjustRightBottomPosition = adjust.rightBottomMockMove({ originColorMedia, imageData, width }) // 修正后右下角坐标
    const adjustWidth = adjustRightBottomPosition[0] - adjustLeftTopPosition[0] // 修正后width
    const adjustHeight = adjustRightBottomPosition[1] - adjustLeftTopPosition[1] // 修正后height

    const x = adjustLeftTopPosition[0] 
    const y = adjustLeftTopPosition[1]

    return {
      x,y,width: adjustWidth, height : adjustHeight
    }
  }

  // rgb转hsl
  static RGB2HSL (r: number, g: number, b: number): number[] {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b); const min = Math.min(r, g, b)
    let h; let s; const l = (max + min) / 2

    if (max === min) {
      h = 0
      s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d) + (g < b ? 6 : 0); break
        case g: h = ((b - r) / d) + 2; break
        case b: h = ((r - g) / d) + 4; break
      }
      h /= 6
    }
    return [Math.floor(h * 100), Math.round(s * 100), Math.round(l * 100)]
  }

  // hex转rgb
  public hex2rgb(hex: string): number[] {
    return [parseInt("0x" +hex.slice(1, 3)),parseInt("0x" + hex.slice(3, 5)),parseInt("0x" + hex.slice(5, 7))]
  }

  // RGB2HEX
  public rgb2hex(rgb: number[]): string {
    const r = rgb[0]
    const g = rgb[1]
    const b = rgb[2]
    return ((r << 16) | (g << 8) | b).toString(16);
  }

}
