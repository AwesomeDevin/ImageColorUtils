class ImageColorUtils {
    constructor(params) {
        const { leftTopPosition = [0, 0], rightBottomPosition = [1, 1], mockMovePx = 30, boundaryValue = 10 } = params || {};
        this.leftTopPosition = leftTopPosition;
        this.rightBottomPosition = rightBottomPosition;
        this.mockMovePx = mockMovePx;
        this.boundaryValue = boundaryValue;
        this.lineArray = {
            top: this.getArrayFromTopLine(),
            left: this.getArrayFromLeftLine(),
            right: this.getArrayFromRightLine(),
            bottom: this.getArrayFromBottomLine(),
        };
    }
    pickColor(imageData, x, y, width, type = 'rgb') {
        return type === 'rgb' ? ImageColorUtils.getRGB(imageData.data, x, y, width) : ImageColorUtils.getHSL(imageData.data, x, y, width);
    }
    pickLineColor(imageData, width, type, valueType = 'rgb') {
        const data = imageData.data;
        const media = {};
        for (const key in this.lineArray) {
            if (type && !type.filter(item => item === key).length) {
                continue;
            }
            const lineArray = this.lineArray[key];
            const rgbArray = [];
            for (const position of lineArray) {
                const x = position[0];
                const y = position[1];
                const [r, g, b] = ImageColorUtils.getRGB(data, x, y, width);
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
    compare(oldVal, newVal) {
        return !ImageColorUtils.isAdjust(oldVal, newVal, this.boundaryValue);
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
    getArrayFromTopLine() {
        const result = [];
        const leftTopX = this.leftTopPosition[0];
        const leftTopY = this.leftTopPosition[1];
        const rightBottomX = this.rightBottomPosition[0];
        for (let x = leftTopX; x <= rightBottomX; x++) {
            result.push([x, leftTopY]);
        }
        return result;
    }
    getArrayFromRightLine() {
        const result = [];
        const leftTopY = this.leftTopPosition[1];
        const rightBottomX = this.rightBottomPosition[0];
        const rightBottomY = this.rightBottomPosition[1];
        for (let y = leftTopY; y <= rightBottomY; y++) {
            result.push([rightBottomX, y]);
        }
        return result;
    }
    getArrayFromBottomLine() {
        const result = [];
        const leftTopX = this.leftTopPosition[0];
        const rightBottomX = this.rightBottomPosition[0];
        const rightBottomY = this.rightBottomPosition[1];
        for (let x = leftTopX; x <= rightBottomX; x++) {
            result.push([x, rightBottomY]);
        }
        return result;
    }
    getArrayFromLeftLine() {
        const result = [];
        const leftTopX = this.leftTopPosition[0];
        const leftTopY = this.leftTopPosition[1];
        const rightBottomY = this.rightBottomPosition[1];
        for (let y = leftTopY; y <= rightBottomY; y++) {
            result.push([leftTopX, y]);
        }
        return result;
    }
    leftTopMockMove({ originColorMedia, imageData, width }) {
        const mockMovePx = this.mockMovePx;
        let leftTopx = this.leftTopPosition[0];
        let leftTopy = this.leftTopPosition[1];
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'left';
            const movePx = -count;
            const mockLeftTopx = leftTopx + movePx;
            const adjust = new ImageColorUtils({ leftTopPosition: [mockLeftTopx, leftTopy], rightBottomPosition: this.rightBottomPosition, mockMovePx: this.mockMovePx });
            const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
                leftTopx = mockLeftTopx;
                break;
            }
        }
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'top';
            const movePx = -count;
            const mockLeftTopy = leftTopy + movePx;
            const adjust = new ImageColorUtils({ leftTopPosition: [leftTopx, mockLeftTopy], rightBottomPosition: this.rightBottomPosition, mockMovePx: this.mockMovePx });
            const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
                leftTopy = mockLeftTopy;
                break;
            }
        }
        return [leftTopx, leftTopy];
    }
    rightBottomMockMove({ originColorMedia, imageData, width }) {
        const mockMovePx = this.mockMovePx;
        let rightBottomx = this.rightBottomPosition[0];
        let rightBottomy = this.rightBottomPosition[1];
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'right';
            const movePx = count;
            const mockRightBotttonx = rightBottomx + movePx;
            const adjust = new ImageColorUtils({ leftTopPosition: this.leftTopPosition, rightBottomPosition: [mockRightBotttonx, rightBottomy], mockMovePx: this.mockMovePx });
            const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
                rightBottomx = mockRightBotttonx;
                break;
            }
        }
        for (let count = 1; count <= mockMovePx; count++) {
            const key = 'bottom';
            const movePx = count;
            const mockRightBottomy = rightBottomy + movePx;
            const adjust = new ImageColorUtils({ leftTopPosition: this.leftTopPosition, rightBottomPosition: [rightBottomx, mockRightBottomy], mockMovePx: this.mockMovePx });
            const mockHslMedia = adjust.pickLineColor(imageData, width, [key])[key];
            if (ImageColorUtils.isAdjust(originColorMedia[key], mockHslMedia, this.boundaryValue)) {
                rightBottomy = mockRightBottomy;
                break;
            }
        }
        return [rightBottomx, rightBottomy];
    }
    adjust(img, width, height) {
        const offscreen = new OffscreenCanvas(width, height);
        const ctx = offscreen.getContext('2d');
        ctx && ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx && ctx.getImageData(0, 0, width, height);
        const params = Object.assign({ leftTopPosition: this.leftTopPosition, rightBottomPosition: this.rightBottomPosition }, this.mockMovePx && { mockMovePx: this.mockMovePx }, this.boundaryValue && { boundaryValue: this.boundaryValue });
        const adjust = new ImageColorUtils(params);
        const originColorMedia = adjust.pickLineColor(imageData, width);
        const adjustLeftTopPosition = adjust.leftTopMockMove({ originColorMedia, imageData, width });
        const adjustRightBottomPosition = adjust.rightBottomMockMove({ originColorMedia, imageData, width });
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
    hex2rgb(hex) {
        return [parseInt("0x" + hex.slice(1, 3)), parseInt("0x" + hex.slice(3, 5)), parseInt("0x" + hex.slice(5, 7))];
    }
    rgb2hex(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        const b = rgb[2];
        return ((r << 16) | (g << 8) | b).toString(16);
    }
}

export { ImageColorUtils };
