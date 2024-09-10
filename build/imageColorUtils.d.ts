type ImageData = {
    data: Uint8ClampedArray;
};
interface ICommon {
    mockMovePx?: number;
    boundaryValue?: number;
    ParticleSize?: number;
    onload?: () => void;
}
interface IImageBitmap {
    origin: ImageBitmap;
    width: number;
    height: number;
}
interface IHTMLImageElement {
    origin: HTMLImageElement;
    width: number;
    height: number;
}
interface IImageUrl {
    origin: string;
    width?: number;
    height?: number;
}
type AdjustConstructor = ICommon & (IImageBitmap | IHTMLImageElement | IImageUrl);
interface MediaValue {
    [key: string]: number[];
}
interface MockMoveParams {
    originColorMedia: MediaValue;
    leftTopPosition: number[];
    rightBottomPosition: number[];
}
interface PickLineColorParams {
    leftTopPosition: number[];
    rightBottomPosition: number[];
    scopes?: string[];
}
export declare class ImageColorUtils {
    private static mockMovePx;
    private static boundaryValue;
    private static ParticleSize;
    canvas: OffscreenCanvas;
    ctx: OffscreenRenderingContext;
    imageData: ImageData;
    onload: () => void;
    constructor(params: AdjustConstructor);
    private init;
    private initCanvas;
    pickColor(x: number, y: number): number[];
    pickLineColor({ leftTopPosition, rightBottomPosition, scopes, }: PickLineColorParams): MediaValue;
    private static isAdjust;
    static compare(oldVal: number[], newVal: number[], boundaryValue?: number, type?: 'lab' | 'rgb'): boolean;
    private static getAverage;
    private static getMost;
    private static getMedian;
    private static getRGB;
    private getArrayFromTopLine;
    private getArrayFromRightLine;
    private getArrayFromBottomLine;
    private getArrayFromLeftLine;
    leftTopMockMove({ originColorMedia, leftTopPosition, rightBottomPosition, }: MockMoveParams): number[];
    rightBottomMockMove({ originColorMedia, leftTopPosition, rightBottomPosition, }: MockMoveParams): number[];
    adjust(leftTopPosition: number[], rightBottomPosition: number[]): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    pickColors(): {
        rgb: string[];
        hex: string[];
    };
}
export {};
