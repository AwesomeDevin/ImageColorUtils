
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
const majorityElement = function (nums) {
    let majority_element = null;
    let count = 0;
    for (const num of nums) {
        if (count == 0) {
            majority_element = num;
        }
        if (num != majority_element) {
            count--;
        }
        else {
            count++;
        }
    }
    return majority_element;
};
class ImageColorUtils {
    constructor(params) {
        const { origin, mockMovePx = 30, boundaryValue = 10, ParticleSize = 4, width, height, onload, } = params || {};
        if (!origin) {
            throw new Error('Origin is necessary');
        }
        else if ((origin instanceof ImageBitmap || origin instanceof HTMLImageElement) &&
            (!width || !height)) {
            throw new Error('Because of origin is not a http link, width and height is necessary ');
        }
        this.onload = onload;
        ImageColorUtils.ParticleSize = ParticleSize;
        ImageColorUtils.mockMovePx = mockMovePx;
        ImageColorUtils.boundaryValue = boundaryValue;
        this.init(origin, width, height)
            .catch((error) => {
            console.error(error);
        })
            .then(() => {
            this.onload && this.onload();
        });
    }
    init(origin, width, height) {
        return new Promise((resolve, reject) => {
            if (typeof origin === 'string') {
                const img = new Image();
                img.src = origin;
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvasWidth = width || img.width;
                    const canvasHeight = height || (canvasWidth / img.width) * img.height;
                    this.initCanvas(img, canvasWidth, canvasHeight);
                    resolve(true);
                };
                if (img.complete) {
                    const canvasWidth = width || img.width;
                    const canvasHeight = height || (canvasWidth / img.width) * img.height;
                    this.initCanvas(img, canvasWidth, canvasHeight);
                    resolve(true);
                }
            }
            else if (origin instanceof ImageBitmap) {
                this.initCanvas(origin, width, height);
                resolve(true);
            }
            else if (origin instanceof HTMLImageElement) {
                this.initCanvas(origin, width, height);
                resolve(true);
            }
            else {
                reject(new Error('The origin format is not supported'));
            }
        });
    }
    initCanvas(img, width, height) {
        try {
            this.canvas = new OffscreenCanvas(width, height);
            this.ctx = this.canvas.getContext('2d');
            this.ctx && this.ctx.drawImage(img, 0, 0, width, height);
            this.imageData = this.ctx && this.ctx.getImageData(0, 0, width, height);
        }
        catch (e) {
            throw new Error(e);
        }
    }
    pickColor(x, y, type = 'rgb') {
        return type === 'rgb'
            ? ImageColorUtils.getRGB(this.imageData.data, x, y, this.canvas.width)
            : ImageColorUtils.getHSL(this.imageData.data, x, y, this.canvas.width);
    }
    pickLineColor({ leftTopPosition, rightBottomPosition, scopes, valueType = 'rgb', }) {
        const data = this.imageData.data;
        const media = {};
        const lineArrayCollection = {
            top: this.getArrayFromTopLine(leftTopPosition, rightBottomPosition),
            left: this.getArrayFromLeftLine(leftTopPosition, rightBottomPosition),
            right: this.getArrayFromRightLine(leftTopPosition, rightBottomPosition),
            bottom: this.getArrayFromBottomLine(leftTopPosition, rightBottomPosition),
        };
        for (const key in lineArrayCollection) {
            if (scopes && !scopes.filter((item) => item === key).length) {
                continue;
            }
            const lineArray = lineArrayCollection[key];
            const rgbArray = [];
            for (const position of lineArray) {
                const x = position[0];
                const y = position[1];
                const [r, g, b] = ImageColorUtils.getRGB(data, x, y, this.canvas.width);
                rgbArray.push([r, g, b]);
            }
            media[key] = ImageColorUtils.getMedian(rgbArray, valueType);
        }
        return media;
    }
    static isAdjust(oldVal, newVal, boundaryValue, type) {
        const val = boundaryValue;
        let distance;
        if (!type || type === 'rgb') {
            const [R_1, G_1, B_1] = oldVal;
            const [R_2, G_2, B_2] = newVal;
            const rmean = (R_1 + R_2) / 2;
            const R = R_1 - R_2;
            const G = G_1 - G_2;
            const B = B_1 - B_2;
            distance = Math.sqrt((2 + rmean / 256) * Math.pow(R, 2) +
                4 * Math.pow(G, 2) +
                (2 + (255 - rmean) / 256) * Math.pow(B, 2));
        }
        else if (type === 'lab') {
            const labOldVal = ImageColorUtils.rgb2lab(oldVal);
            const labnewVal = ImageColorUtils.rgb2lab(newVal);
            const [L_1, A_1, B_1] = labOldVal;
            const [L_2, A_2, B_2] = labnewVal;
            distance = Math.abs(((L_1 - L_2) * 2 + (A_1 - A_2) * 2 + (B_1 - B_2) * 2) / 2);
        }
        if (distance >= val) {
            return true;
        }
        return false;
    }
    static compare(oldVal, newVal, boundaryValue, type) {
        return !ImageColorUtils.isAdjust(oldVal, newVal, boundaryValue || ImageColorUtils.boundaryValue, type);
    }
    static getAverage(data, valueType) {
        const total = data.reduce((x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]]);
        return valueType === 'rgb'
            ? [
                Math.round(total[0] / data.length),
                Math.round(total[1] / data.length),
                Math.round(total[2] / data.length),
            ]
            : ImageColorUtils.RGB2HSL(Math.round(total[0] / data.length), Math.round(total[1] / data.length), Math.round(total[2] / data.length));
    }
    static getMost(data) {
        const r = majorityElement(data.map((item) => item[0]));
        const g = majorityElement(data.map((item) => item[1]));
        const b = majorityElement(data.map((item) => item[2]));
        return [r, g, b];
    }
    static getMedian(data, valueType) {
        const total0 = data.map((item) => item[0]).sort((x, y) => (x > y ? 1 : -1));
        const total1 = data.map((item) => item[1]).sort((x, y) => (x > y ? 1 : -1));
        const total2 = data.map((item) => item[2]).sort((x, y) => (x > y ? 1 : -1));
        const length = data.length;
        if (length % 2 === 0) {
            const r = (total0[length / 2] + total0[length / 2 - 1]) / 2;
            const g = (total1[length / 2] + total1[length / 2 - 1]) / 2;
            const b = (total2[length / 2] + total2[length / 2 - 1]) / 2;
            return valueType === 'rgb'
                ? [r, g, b]
                : ImageColorUtils.RGB2HSL(r, g, b);
        }
        const r = total0[(length + 1) / 2];
        const g = total1[(length + 1) / 2];
        const b = total2[(length + 1) / 2];
        return valueType === 'rgb'
            ? [r, g, b]
            : ImageColorUtils.RGB2HSL(r, g, b);
    }
    static getHSL(data, x, y, width) {
        const index = (width * (y - 1) + x - 1) * 4;
        const [r, g, b] = [data[index], data[index + 1], data[index + 2]];
        return ImageColorUtils.RGB2HSL(r, g, b);
    }
    static getRGB(data, x, y, width) {
        const index = (width * (y - 1) + x - 1) * 4;
        const [r, g, b, a] = [
            data[index],
            data[index + 1],
            data[index + 2],
            data[index + 3],
        ];
        return [r, g, b, a];
    }
    getArrayFromTopLine(leftTopPosition, rightBottomPosition) {
        const result = [];
        const leftTopX = leftTopPosition[0];
        const leftTopY = leftTopPosition[1];
        const rightBottomX = rightBottomPosition[0];
        for (let x = leftTopX; x <= rightBottomX; x++) {
            result.push([x, leftTopY]);
        }
        return result;
    }
    getArrayFromRightLine(leftTopPosition, rightBottomPosition) {
        const result = [];
        const leftTopY = leftTopPosition[1];
        const rightBottomX = rightBottomPosition[0];
        const rightBottomY = rightBottomPosition[1];
        for (let y = leftTopY; y <= rightBottomY; y++) {
            result.push([rightBottomX, y]);
        }
        return result;
    }
    getArrayFromBottomLine(leftTopPosition, rightBottomPosition) {
        const result = [];
        const leftTopX = leftTopPosition[0];
        const rightBottomX = rightBottomPosition[0];
        const rightBottomY = rightBottomPosition[1];
        for (let x = leftTopX; x <= rightBottomX; x++) {
            result.push([x, rightBottomY]);
        }
        return result;
    }
    getArrayFromLeftLine(leftTopPosition, rightBottomPosition) {
        const result = [];
        const leftTopX = leftTopPosition[0];
        const leftTopY = leftTopPosition[1];
        const rightBottomY = rightBottomPosition[1];
        for (let y = leftTopY; y <= rightBottomY; y++) {
            result.push([leftTopX, y]);
        }
        return result;
    }
    leftTopMockMove({ originColorMedia, leftTopPosition, rightBottomPosition, }) {
        const mockMovePx = ImageColorUtils.mockMovePx;
        let leftTopx = leftTopPosition[0];
        let leftTopy = leftTopPosition[1];
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'left';
            const movePx = -count;
            const mockLeftTopx = leftTopx + movePx;
            const mockHslMedia = this.pickLineColor({
                leftTopPosition: [mockLeftTopx, leftTopy],
                rightBottomPosition,
                scopes: [key],
            })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                leftTopx = mockLeftTopx;
                break;
            }
        }
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'top';
            const movePx = -count;
            const mockLeftTopy = leftTopy + movePx;
            const mockHslMedia = this.pickLineColor({
                leftTopPosition: [leftTopx, mockLeftTopy],
                rightBottomPosition,
                scopes: [key],
            })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                leftTopy = mockLeftTopy;
                break;
            }
        }
        return [leftTopx, leftTopy];
    }
    rightBottomMockMove({ originColorMedia, leftTopPosition, rightBottomPosition, }) {
        const mockMovePx = ImageColorUtils.mockMovePx;
        let rightBottomx = rightBottomPosition[0];
        let rightBottomy = rightBottomPosition[1];
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'right';
            const movePx = count;
            const mockRightBotttonx = rightBottomx + movePx;
            const mockHslMedia = this.pickLineColor({
                leftTopPosition,
                rightBottomPosition: [mockRightBotttonx, rightBottomy],
                scopes: [key],
            })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                rightBottomx = mockRightBotttonx;
                break;
            }
        }
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'bottom';
            const movePx = count;
            const mockRightBottomy = rightBottomy + movePx;
            const mockHslMedia = this.pickLineColor({
                leftTopPosition,
                rightBottomPosition: [rightBottomx, mockRightBottomy],
                scopes: [key],
            })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                rightBottomy = mockRightBottomy;
                break;
            }
        }
        return [rightBottomx, rightBottomy];
    }
    adjust(leftTopPosition, rightBottomPosition) {
        if (!leftTopPosition.length || !rightBottomPosition.length) {
            throw new Error('Position is invalid！');
        }
        const originColorMedia = this.pickLineColor({
            leftTopPosition,
            rightBottomPosition,
        });
        const adjustLeftTopPosition = this.leftTopMockMove({
            originColorMedia,
            leftTopPosition,
            rightBottomPosition,
        });
        const adjustRightBottomPosition = this.rightBottomMockMove({
            originColorMedia,
            leftTopPosition,
            rightBottomPosition,
        });
        const adjustWidth = adjustRightBottomPosition[0] - adjustLeftTopPosition[0];
        const adjustHeight = adjustRightBottomPosition[1] - adjustLeftTopPosition[1];
        const x = adjustLeftTopPosition[0];
        const y = adjustLeftTopPosition[1];
        return {
            x,
            y,
            width: adjustWidth,
            height: adjustHeight,
        };
    }
    static RGB2HSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        let s;
        const l = (max + min) / 2;
        if (max === min) {
            h = 0;
            s = 0;
        }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [Math.floor(h * 100), Math.round(s * 100), Math.round(l * 100)];
    }
    static hex2rgb(hex) {
        return [
            parseInt('0x' + hex.slice(1, 3)),
            parseInt('0x' + hex.slice(3, 5)),
            parseInt('0x' + hex.slice(5, 7)),
        ];
    }
    static rgb2hex(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        const b = rgb[2];
        return ((r << 16) | (g << 8) | b).toString(16);
    }
    static rgb2lab(rgb) {
        let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
        y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
        z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
        return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
    }
    pickColors() {
        const similarColorsMap = {};
        const res = [];
        const boundaryValue = 7;
        let lastColor;
        for (let x = 1; x < this.canvas.width; x += ImageColorUtils.ParticleSize) {
            for (let y = 1; y < this.canvas.height; y += ImageColorUtils.ParticleSize) {
                const similarValues = Object.values(similarColorsMap);
                const rgb = ImageColorUtils.getRGB(this.imageData.data, x, y, this.canvas.width);
                lastColor = rgb;
                if (rgb[3] === 0) {
                    continue;
                }
                else if (!similarValues.length) {
                    similarColorsMap[similarValues.length] = [rgb];
                }
                else if (similarValues.length &&
                    lastColor &&
                    ImageColorUtils.compare(rgb, lastColor, ImageColorUtils.boundaryValue)) {
                    let insert = false;
                    for (const similarValue of similarValues) {
                        if (ImageColorUtils.compare(rgb, similarValue[0], boundaryValue, 'lab') ||
                            ImageColorUtils.compare(rgb, similarValue[similarValue.length - 1], boundaryValue, 'lab')) {
                            similarValue.push(rgb);
                            insert = true;
                        }
                    }
                    if (!insert) {
                        similarColorsMap[similarValues.length] = [rgb];
                    }
                }
            }
        }
        const values = Object.values(similarColorsMap);
        values
            .sort((x, y) => (x.length < y.length ? 1 : -1))
            .filter((item) => item.length > 100)
            .forEach((item) => {
            if (!res.some((value) => ImageColorUtils.compare(value, ImageColorUtils.getMost(item), boundaryValue, 'lab'))) {
                res.push(ImageColorUtils.getMost(item));
            }
        });
        return {
            rgb: res.map((item) => `rgb(${item.join(',')})`),
            hex: res.map((item) => '#' + ImageColorUtils.rgb2hex(item)),
        };
    }
}

export { ImageColorUtils };
