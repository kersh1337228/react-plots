import {
    AxisData,
    GridObject
} from '../../../../utils/types/display';
import { Dispatch } from 'react';
import { Callback } from '../../../../utils/types/callable';

export declare interface AxisProps {
    size: number
}

export default abstract class Axis {
    public global: AxisData;
    public local: AxisData;
    public delta: AxisData;
    public drag: boolean;
    public mousePosition: {
        x: number;
        y: number;
    };
    // @ts-ignore
    public setState: React.Dispatch<React.SetStateAction<Axis>>;

    protected constructor(
        public readonly label: 'x' | 'y',
        public readonly name?: string,
        public font: {
            family: string;
            size: number;
        } = { family: 'Serif', size: 10 },
        public grid: GridObject = { amount: 5, color: '#d9d9d9', width: 1 },
        public scrollSpeed = 1
    ) {
        this.global = { min: 0, max: 0, scale: 1, translate: 0 };
        this.local = { min: 0, max: 0, scale: 1, translate: 0 };
        this.delta = { min: 5, max: 500, scale: 0, translate: 0 };
        this.drag = false;
        this.mousePosition = {
            x: 0,
            y: 0
        };
    }

    public abstract reScale(ds: number, callback?: Callback): void;

    public abstract reTranslate(dt: number, callback?: Callback): void;

    public async wheelHandler(event: React.WheelEvent) {
        event.preventDefault()
        event.stopPropagation()
        this.reScale(-event.deltaY / 2000 * this.scale);
    }

    public mouseMoveHandler(event: React.MouseEvent) {
        if (this.drag) {
            const window = (event.target as HTMLCanvasElement)
                .getBoundingClientRect();
            const coordinates = {
                x: event.clientX - window.left,
                y: event.clientY - window.top
            };
            this.reScale(( // TODO: callback
                this.mousePosition[this.label] - coordinates[this.label]
            ) * this.scrollSpeed * this.scale,
                () => {
                    this.setState({
                        ...this,
                        mousePosition: coordinates
                    });
                }
            );
        }
    }

    public mouseOutHandler(_: React.MouseEvent) {
        this.setState({
            ...this,
            drag: false
        });
    };

    public mouseDownHandler(event: React.MouseEvent) {
        this.setState({
            ...this,
            mousePosition: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            }
        });
    };

    public mouseUpHandler(_: React.MouseEvent) {
        this.setState({
            ...this,
            drag: false
        });
    };

    public get min() {
        return this.local.min;
    };

    public get max() {
        return this.local.max;
    };

    public get spread() {
        return this.local.max - this.local.min;
    };

    public get scale() {
        return this.local.scale + this.delta.scale;
    };

    public get translate() {
        return this.local.translate + this.delta.translate;
    };
}
