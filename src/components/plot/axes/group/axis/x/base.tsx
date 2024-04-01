import {
    AxesGroupReal
} from '../../AxesGroup';
import {
    AxisGrid,
    Font
} from '../../../../../../utils_refactor/types/display';
import AxisBase from '../../../common/axis/base';
import React, {
    createRef,
    useEffect
} from 'react';
import {
    axisSize_
} from '../../../../../../utils_refactor/constants/plot';

export default abstract class XAxis extends AxisBase<
    AxesGroupReal
> {
    protected constructor(
        axes: AxesGroupReal,
        visible: boolean = true,
        scrollSpeed: number = 1,
        name: string = 'x',
        grid: AxisGrid = {
            amount: 5,
            color: '#d9d9d9',
            width: 1
        },
        font: Font = {
            family: 'Serif',
            size: 10
        }
    ) {
        super(axes, 'x', visible, scrollSpeed, name, grid, font);
    };

    public override reScale(ds: number) {
        for (const axes of this.axes.axes)
            axes.axis.x.reScale(ds);
    };

    public override reTranslate(dt: number) {
        for (const axes of this.axes.axes)
            axes.axis.x.reTranslate(dt);
    }

    public override render() {
        const mainRef = createRef<HTMLCanvasElement>(),
            tooltipRef = createRef<HTMLCanvasElement>();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            tooltipRef.current?.addEventListener(
                'wheel', this.wheelHandler, { passive: false });

            this.ctx = {
                main: mainRef.current?.getContext('2d'),
                tooltip: tooltipRef.current?.getContext('2d')
            };
        }, []);

        return this.visible ? <>
            <canvas
                ref={mainRef}
                className={'axes x scale'}
                style={{
                    width: this.axes.size.width,
                    height: axisSize_.height,
                    gridRowStart: this.axes.rows + 1,
                    gridRowEnd: this.axes.rows + 2
                }}
                width={this.axes.size.width}
                height={axisSize_.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axes x tooltip'}
                style={{
                    width: this.axes.size.width,
                    height: axisSize_.height,
                    gridRowStart: this.axes.rows + 1,
                    gridRowEnd: this.axes.rows + 2
                }}
                width={this.axes.size.width}
                height={axisSize_.height}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
        </> : null;
    }
}
