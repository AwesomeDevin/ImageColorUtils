'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ImageColorUtils {
    constructor(params) {
        const { origin, mockMovePx = 30, boundaryValue = 10, width, height } = params || {};
        if (!origin) {
            throw new Error('Origin is necessary');
        }
        else if ((origin instanceof ImageBitmap || origin instanceof HTMLImageElement) && (!width || !height)) {
            throw new Error('Because of origin is not a http link, width and height is necessary ');
        }
        ImageColorUtils.mockMovePx = mockMovePx;
        ImageColorUtils.boundaryValue = boundaryValue;
        this.init(origin, width, height);
    }
    init(origin, width, height) {
        try {
            if (typeof origin === 'string') {
                const img = new Image();
                img.src = origin;
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    const canvasWidth = width || img.width;
                    const canvasHeight = height || (canvasWidth / img.width) * img.height;
                    this.initCanvas(img, canvasWidth, canvasHeight);
                };
                if (img.complete) {
                    const canvasWidth = width || img.width;
                    const canvasHeight = height || (canvasWidth / img.width) * img.height;
                    this.initCanvas(img, canvasWidth, canvasHeight);
                }
            }
            else if (origin instanceof ImageBitmap) {
                this.initCanvas(origin, width, height);
            }
            else if (origin instanceof HTMLImageElement) {
                this.initCanvas(origin, width, height);
            }
            else {
                throw new Error('The origin format is not supported');
            }
        }
        catch (e) {
            throw new Error(e);
        }
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
        return type === 'rgb' ? ImageColorUtils.getRGB(this.imageData.data, x, y, this.canvas.width) : ImageColorUtils.getHSL(this.imageData.data, x, y, this.canvas.width);
    }
    pickLineColor({ leftTopPosition, rightBottomPosition, scopes, valueType = 'rgb' }) {
        const data = this.imageData.data;
        const media = {};
        const lineArrayCollection = {
            top: this.getArrayFromTopLine(leftTopPosition, rightBottomPosition),
            left: this.getArrayFromLeftLine(leftTopPosition, rightBottomPosition),
            right: this.getArrayFromRightLine(leftTopPosition, rightBottomPosition),
            bottom: this.getArrayFromBottomLine(leftTopPosition, rightBottomPosition),
        };
        for (const key in lineArrayCollection) {
            if (scopes && !scopes.filter(item => item === key).length) {
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
    static isAdjust(oldVal, newVal, boundaryValue) {
        const val = boundaryValue;
        const diffH = Math.abs(oldVal[0] - newVal[0]);
        const diffS = Math.abs(oldVal[1] - newVal[1]);
        const diffL = Math.abs(oldVal[2] - newVal[2]);
        if (diffH >= val || diffL >= val || diffS >= val) {
            return true;
        }
        return false;
    }
    static compare(oldVal, newVal, boundaryValue) {
        return !ImageColorUtils.isAdjust(oldVal, newVal, boundaryValue || ImageColorUtils.boundaryValue);
    }
    static getAverage(data, valueType) {
        const total = data.reduce((x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]]);
        return valueType === 'rgb' ?
            [Math.round(total[0] / data.length), Math.round(total[1] / data.length), Math.round(total[2] / data.length)]
            :
                ImageColorUtils.RGB2HSL(Math.round(total[0] / data.length), Math.round(total[1] / data.length), Math.round(total[2] / data.length));
    }
    static getMedian(data, valueType) {
        const total0 = data.map(item => item[0]).sort((x, y) => (x > y ? 1 : -1));
        const total1 = data.map(item => item[1]).sort((x, y) => (x > y ? 1 : -1));
        const total2 = data.map(item => item[2]).sort((x, y) => (x > y ? 1 : -1));
        const length = data.length;
        if (length % 2 === 0) {
            const r = (total0[length / 2] + total0[(length / 2) - 1]) / 2;
            const g = (total1[length / 2] + total1[(length / 2) - 1]) / 2;
            const b = (total2[length / 2] + total2[(length / 2) - 1]) / 2;
            return valueType === 'rgb' ?
                [r, g, b]
                :
                    ImageColorUtils.RGB2HSL(r, g, b);
        }
        const r = total0[(length + 1) / 2];
        const g = total1[(length + 1) / 2];
        const b = total2[(length + 1) / 2];
        return valueType === 'rgb' ?
            [r, g, b]
            :
                ImageColorUtils.RGB2HSL(r, g, b);
    }
    static getHSL(data, x, y, width) {
        const index = (((width * (y - 1)) + x - 1) * 4);
        const [r, g, b] = [
            data[index],
            data[index + 1],
            data[index + 2]
        ];
        return ImageColorUtils.RGB2HSL(r, g, b);
    }
    static getRGB(data, x, y, width) {
        const index = (((width * (y - 1)) + x - 1) * 4);
        const [r, g, b] = [
            data[index],
            data[index + 1],
            data[index + 2]
        ];
        return [r, g, b];
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
    leftTopMockMove({ originColorMedia, leftTopPosition, rightBottomPosition }) {
        const mockMovePx = ImageColorUtils.mockMovePx;
        let leftTopx = leftTopPosition[0];
        let leftTopy = leftTopPosition[1];
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'left';
            const movePx = -count;
            const mockLeftTopx = leftTopx + movePx;
            const mockHslMedia = this.pickLineColor({ leftTopPosition: [mockLeftTopx, leftTopy], rightBottomPosition, scopes: [key] })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                leftTopx = mockLeftTopx;
                break;
            }
        }
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'top';
            const movePx = -count;
            const mockLeftTopy = leftTopy + movePx;
            const mockHslMedia = this.pickLineColor({ leftTopPosition: [leftTopx, mockLeftTopy], rightBottomPosition, scopes: [key] })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                leftTopy = mockLeftTopy;
                break;
            }
        }
        return [leftTopx, leftTopy];
    }
    rightBottomMockMove({ originColorMedia, leftTopPosition, rightBottomPosition }) {
        const mockMovePx = ImageColorUtils.mockMovePx;
        let rightBottomx = rightBottomPosition[0];
        let rightBottomy = rightBottomPosition[1];
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'right';
            const movePx = count;
            const mockRightBotttonx = rightBottomx + movePx;
            const mockHslMedia = this.pickLineColor({ leftTopPosition, rightBottomPosition: [mockRightBotttonx, rightBottomy], scopes: [key] })[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, ImageColorUtils.boundaryValue)) {
                rightBottomx = mockRightBotttonx;
                break;
            }
        }
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'bottom';
            const movePx = count;
            const mockRightBottomy = rightBottomy + movePx;
            const mockHslMedia = this.pickLineColor({ leftTopPosition, rightBottomPosition: [rightBottomx, mockRightBottomy], scopes: [key] })[key];
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
        const originColorMedia = this.pickLineColor({ leftTopPosition, rightBottomPosition });
        const adjustLeftTopPosition = this.leftTopMockMove({ originColorMedia, leftTopPosition, rightBottomPosition });
        const adjustRightBottomPosition = this.rightBottomMockMove({ originColorMedia, leftTopPosition, rightBottomPosition });
        const adjustWidth = adjustRightBottomPosition[0] - adjustLeftTopPosition[0];
        const adjustHeight = adjustRightBottomPosition[1] - adjustLeftTopPosition[1];
        const x = adjustLeftTopPosition[0];
        const y = adjustLeftTopPosition[1];
        return {
            x, y, width: adjustWidth, height: adjustHeight
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
                    h = ((g - b) / d) + (g < b ? 6 : 0);
                    break;
                case g:
                    h = ((b - r) / d) + 2;
                    break;
                case b:
                    h = ((r - g) / d) + 4;
                    break;
            }
            h /= 6;
        }
        return [Math.floor(h * 100), Math.round(s * 100), Math.round(l * 100)];
    }
    static hex2rgb(hex) {
        return [parseInt("0x" + hex.slice(1, 3)), parseInt("0x" + hex.slice(3, 5)), parseInt("0x" + hex.slice(5, 7))];
    }
    static rgb2hex(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        const b = rgb[2];
        return ((r << 16) | (g << 8) | b).toString(16);
    }
}

exports.ImageColorUtils = ImageColorUtils;
