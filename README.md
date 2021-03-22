# image-color-utils

## DESC
提供`取色`、`色值相似度对比`、`色彩边界值计算`等能力。  
### [demo](http://47.105.188.15:3002/)
### [codesandbox](https://codesandbox.io/s/image-color-utils-ghrvb)
![](https://raw.githubusercontent.com/o2team/image-color-utils/main/static/demo4.gif)
## API
- [ImageColorUtils](#-imagecolorutils)
- [pickColor](#-pickcolor---提取色值)
- [compare](#-compare---色值相识度对比)
- [adjust](#-adjust---色彩边界值计算)
- [hex2rgb](#-hex2rgb---hex色值转rgb色值)
- [rgb2hex](#-rgb2hex---rgb色值转hex色值)
- 待开发(图片自动抓取、截图)

## Install
```
npm install image-color-utils --save
```

### \# ImageColorUtils
```javascript
const imageColorUtils = new ImageColorUtils(params)
```
##### Arguments
Name | Desc | Type | Default | required
---- | ---- | ---- | ----- | ----
leftTopPosition | 所选区域初始左上角坐标 | number[] | [0,0] | false
rightBottomPosition | 所选区域初始右下角坐标 | number[] | [1,1] | false
mockMovePx |  边界扫描距离（最大移动距离, 扫描方向由内向外） | number | 30 | false
boundaryValue | 色彩边界阈值（作用于色值相似度对比, 阈值越高，相似条件越高） | number | 10 | false
##### Returns
Desc  | Type 
-------- | -------- 
ImageColorUtils实例 | Object

### \# pickColor - 提取色值 
```javascript
import { ImageColorUtils } from 'image-color-utils'

const imageColorUtils = new ImageColorUtils()
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const res = imageColorUtils.pickColor(imageData, x, y, canvas.width)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
imageData | canvasImageData | ImageData | - | true
x | 目标点距离画布左上角x坐标 | number | - | true
y | 目标点距离画布左上角y坐标 | number | - | true
width | 画布宽度 | number | - | true
##### Returns
Desc  | Type 
-------- | -------- 
目标点 rgb 色值 | number[] 

### \# compare - 色值相识度对比
```javascript
import { ImageColorUtils } from 'image-color-utils'

const imageColorUtils = new ImageColorUtils()
const res = imageColorUtils.compare(color1, color2)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
color1 | rgb 色值1 | number[] | - | true
color2 | rgb 色值2 | number[] | - | true
##### Returns
Desc  | Type 
-------- | -------- 
是否相似 | boolean

### \# adjust - 色彩边界值计算
```javascript
import { ImageColorUtils } from 'image-color-utils'

const imageColorUtils = new ImageColorUtils({ leftTopPosition, rightBottomPosition })
const img = new Image()
img.onload = () => {
  const res = imageColorUtils.adjust(img, canvas.width, canvas.height)
}
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
img | img or imagebitmap | HTMLImageElement | ImageBitmap | - | true
width | 画布宽度 | number | - | true
##### Returns
Desc  | Type 
-------- | -------- 
边界计算后左上角坐标(x,y)及区域宽高(width,height) | Object:{x: number, y: number, width: number, height: number}

### \# hex2rgb - HEX色值转RGB色值
```javascript
import { ImageColorUtils } from 'image-color-utils'

const imageColorUtils = new ImageColorUtils()
const rgb = imageColorUtils.HEX2RGB(hex)
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

const imageColorUtils = new ImageColorUtils()
const hex = imageColorUtils.RGB2HEX(rgb)
```
##### Arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
rgb | RGB色值 | number[] | - | true

##### Returns
Desc  | Type 
-------- | -------- 
HEX色值 | string

