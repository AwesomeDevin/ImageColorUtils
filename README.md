# image-color-utils

## DESC
提供`取色`、`色值相似度对比`、`色彩边界值计算`等能力。  
### [demo](http://47.105.188.15:3002/)
### [codesandbox](https://codesandbox.io/s/image-color-utils-ghrvb)
![](https://raw.githubusercontent.com/o2team/image-color-utils/main/static/demo4.gif)


## Install
```
npm install image-color-utils --save
```

## Usage
##### es
```javascript
import { ImageColorUtils } from 'image-color-utils'
```
##### commonjs
```javascript
const { ImageColorUtils } = require('image-color-utils')
```

## API
- [ImageColorUtils](#-imagecolorutils)
- [pickColor](#-pickcolor---提取色值)
- [adjust](#-adjust---色彩边界值计算)
- [compare](#-compare---色值相似度对比)
- [hex2rgb](#-hex2rgb---hex色值转rgb色值)
- [rgb2hex](#-rgb2hex---rgb色值转hex色值)


### \# ImageColorUtils
```javascript
import { ImageColorUtils } from 'image-color-utils'

const params = {
  origin: img,
  width: canvas.width,
  height: canvas.height,
  boundaryValue,
  mockMovePx
}
const imageColorUtils = new ImageColorUtils(params)
```
##### Arguments
Name | Desc | Type | Default | required
---- | ---- | ---- | ----- | ----
origin | 数据源(可以是 http链接 / ImageBitmap / HTMLImageElement ) | string / HTMLImageElement / ImageBitmap  /  | - | true
width | 画板宽度 | number | - | false (不传参将根据图片宽高自适应，origin 为 ImageBitmap / HTMLImageElemen，必填)
height | 画板高度 | number | - | false (不传参将根据图片宽高自适应，origin 为 ImageBitmap / HTMLImageElemen，必填)
mockMovePx |  边界扫描距离（最大边界扫描距离, 扫描方向由内向外） | number | 30 | false
boundaryValue | 色彩边界阈值（作用于色值相似度对比, 阈值越高，相似条件越高） | number | 10 | false
##### Returns
Desc  | Type 
-------- | -------- 
ImageColorUtils实例 | Object

### \# pickColor - 提取色值 
```javascript
import { ImageColorUtils } from 'image-color-utils'


const imageColorUtils = new ImageColorUtils({
  origin: img,
  width: canvas.width,
  height: canvas.height
})
const res = imageColorUtils.pickColor(x, y)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
x | 目标点距离画布左上角x坐标 | number | - | true
y | 目标点距离画布左上角y坐标 | number | - | true

##### Returns
Desc  | Type 
-------- | -------- 
目标点 rgb 色值 | number[] 

### \# adjust - 色彩边界值计算
```javascript
import { ImageColorUtils } from 'image-color-utils'

const imageColorUtils = new ImageColorUtils({ 
  origin: img,
  width: canvas.width, 
  height: canvas.height,  
  boundaryValue,
  mockMovePx
})
imageColorUtils.adjust(leftTopPosition, rightBottomPosition)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
leftTopPosition | 图片所选区域初始左上角坐标 | number[] | [] | false
rightBottomPosition | 图片所选区域初始右下角坐标 | number[] | [] | false

##### Returns
Desc  | Type 
-------- | -------- 
边界计算后左上角坐标(x,y)及区域宽高(width,height) | Object:{x: number, y: number, width: number, height: number}

### \# compare - 色值相似度对比
```javascript
import { ImageColorUtils } from 'image-color-utils'

const res = ImageColorUtils.compare(color1, color2, boundaryValue)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
color1 | rgb 色值1 | number[] | - | true
color2 | rgb 色值2 | number[] | - | true
boundaryValue | 色彩边界阈值（作用于色值相似度对比, 阈值越高，相似条件越高） | number | 10 | false

##### Returns
Desc  | Type 
-------- | -------- 
是否相似 | boolean

### \# hex2rgb - HEX色值转RGB色值
```javascript
import { ImageColorUtils } from 'image-color-utils'

const rgb = ImageColorUtils.hex2rgb(hex)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
hex | HEX色值 | String | - | true

##### Returns
Desc  | Type 
-------- | -------- 
RGB色值 | number[]

### \# rgb2hex - RGB色值转HEX色值
```javascript
import { ImageColorUtils } from 'image-color-utils'

const hex = ImageColorUtils.rgb2hex(rgb)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
rgb | RGB色值 | number[] | - | true

##### Returns
Desc  | Type 
-------- | -------- 
HEX色值 | string


## Attribute
```javascript
import { ImageColorUtils } from 'image-color-utils'

const imageColorUtils = new ImageColorUtils({ 
  origin: img,
  width: canvas.width,
  height: canvas.height,
  boundaryValue,
  mockMovePx
})

console.log(imageColorUtils.canvas)
console.log(imageColorUtils.ctx)
console.log(imageColorUtils.imageData)
```

Name | Type
---  | ---
canvas | OffscreenCanvas
ctx | OffscreenCanvasRenderingContext2D
imageData | ImageData