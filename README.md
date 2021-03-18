# image-color-utils

## DESC
通过`canvas`操作图片，提供`提取色值`、`色值相识度对比`、`色彩边界值计算`等能力。

## API

### ImageColorUtils
```javascript
const imageColorUtils = new ImageColorUtils(params)
```
##### arguments
Name | Desc | Type | Default | required
---- | ---- | ---- | ----- | ----
leftTopPosition | 边界区域初始左上角坐标 | number[] | [0,0] | false
rightBottomPosition | 边界区域初始右下角坐标 | number[] | [1,1] | false
mockMovePx |  边界移动距离 | number | 30 | false
boundaryValue | 色彩边界值（作用于色值相识度对比） | number | 10 | false
##### Returns
Desc  | Type 
-------- | -------- 
ImageColorUtils实例 | Object

### pickColor - 提取色值 
```javascript
import { ImageColorUtils } from 'ImageColorUtils'

const imageColorUtils = new ImageColorUtils()
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const res = imageColorUtils.pickColor(imageData, x, y, canvas.width)
```
##### arguments
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

### compare - 色值相识度对比
```javascript
import { ImageColorUtils } from 'ImageColorUtils'

const imageColorUtils = new ImageColorUtils()
const res = imageColorUtils.compare(color1, color2)
```
##### arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
color1 | rgb 色值1 | number[] | - | true
color2 | rgb 色值2 | number[] | - | true
##### Returns
Desc  | Type 
-------- | -------- 
是否相似 | boolean

### adjust - 色彩边界值计算
```javascript
import { ImageColorUtils } from 'ImageColorUtils'

const imageColorUtils = new ImageColorUtils({ leftTopPosition, rightBottomPosition })
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const res = imageColorUtils.adjust(imageData, canvas.width)
```
##### arguments
Name  | Desc  | Type | Default | required
-------- | -------- | -------- | -------- | -----
imageData | canvasImageData | ImageData | - | true
width | 画布宽度 | number | - | true
##### Returns
Desc  | Type 
-------- | -------- 
边界计算后坐标 | Object:{x: number, y: number, width: number, height: number}


