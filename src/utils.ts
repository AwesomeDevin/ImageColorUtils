const hexColorMatch =
  /^#?(?:([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?|([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?)$/i

export function rgb2value(rgb: number[]): number {
  const [r, g, b] = rgb
  const value = Math.max(r, g, b)
  return value
}

export function rgb2whiteness(rgb: number[]): number {
  const [r, g, b] = rgb
  const whiteness = Math.min(r, g, b)

  return whiteness
}

export function rgb2hue(rgb: number[], fallbackhue = 0): number {
  const [r, g, b] = rgb
  const value = rgb2value(rgb)
  const whiteness = rgb2whiteness(rgb)
  const delta = value - whiteness

  if (delta) {
    // calculate segment
    const segment =
      value === r
        ? (g - b) / delta
        : value === g
        ? (b - r) / delta
        : (r - g) / delta

    // calculate shift
    const shift =
      value === r
        ? segment < 0
          ? 360 / 60
          : 0 / 60
        : value === g
        ? 120 / 60
        : 240 / 60

    // calculate hue
    const hue = (segment + shift) * 60

    return hue
  } else {
    // otherwise return the Hue Fallback
    return fallbackhue
  }
}

export function majorityElement(nums: number[]): number {
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

export function hex2rgb(hex: string): number[] {
  const [, r, g, b, a, rr, gg, bb, aa] = hex.match(hexColorMatch) || []

  if (rr !== undefined || r !== undefined) {
    const red = rr !== undefined ? parseInt(rr, 16) : parseInt(r + r, 16)
    const green = gg !== undefined ? parseInt(gg, 16) : parseInt(g + g, 16)
    const blue = bb !== undefined ? parseInt(bb, 16) : parseInt(b + b, 16)
    const alpha =
      aa !== undefined
        ? parseInt(aa, 16)
        : a !== undefined
        ? parseInt(a + a, 16)
        : 255

    return [red, green, blue, alpha].map((c) => (c * 100) / 255)
  }

  return undefined
}

export function rgb2hex(rgb: number[]): string {
  // if (rgb.length > 3 && rgb[3] !== 1) {
  //   throw new Error('Not support alpha')
  // }
  const [R, G, B, A] = rgb
  let value = '#'
  const newR = R.toString(16)
  const newG = G.toString(16)
  const newB = B.toString(16)

  value += newR.length > 1 ? newR : `0${newR}`
  value += newG.length > 1 ? newG : `0${newG}`
  value += newB.length > 1 ? newB : `0${newB}`

  if (typeof A !== 'undefined' && rgb.length > 3) {
    const newA = Math.round(A * 255).toString(16)
    value += newA.length > 1 ? newA : `0${newA}`
  }

  return value
}

export function rgb2lab(rgb: number[]): number[] {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}


export function rgb2hsl(rgb: number[]): number[] {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    let d = max - min
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
  return [h * 360, s * 100, l * 100]
}

export function rgb2hsv(rgb: number[]): number[] {
  let [r, g, b] = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
      h = 0; // achromatic
  } else {
      switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return [h * 360, s * 100, v * 100]; // 返回的是HSV值，H的范围是0-360，S和V的范围是0-100
}

export function isDeepColorByHsl(hsl: number[]): boolean {
   const lightness = hsl[2] / 100;

   // 如果亮度小于或等于阈值，则为深色  
   return lightness <= 0.6
}


export function isDeepColorByHsv(hsv: number[]): boolean {
  const v = hsv[2] 
  const s = hsv[1]
  console.log(hsv)

  return v <= 60 || s > 40;
}