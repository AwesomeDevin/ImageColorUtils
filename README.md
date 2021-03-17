# image-color-utils

### DESC
通过`canvas`操作图片支持`提取色值`、`色值相识度对比`、`色彩边界值计算`。

### API
##### 提取色值
```javascript
import { ImageColorUtils } from 'ImageColorUtils'

const imageColorUtils = new ImageColorUtils()
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const res = imageColorUtils.pickColor(imageData, x, y, this.canvas.width)
```

##### 色值相识度对比
```javascript
import { ImageColorUtils } from 'ImageColorUtils'

const imageColorUtils = new ImageColorUtils()
const res = imageColorUtils.compare(color1, color2)
```

##### 色彩边界值计算
```javascript
import { ImageColorUtils } from 'ImageColorUtils'

const imageColorUtils = new ImageColorUtils({ leftTopPosition, rightBottomPosition })
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const res = imageColorUtils.adjust(imageData, canvas.width)
```
