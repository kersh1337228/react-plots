import DrawingData from '../base';
import {
    Point,
    PointNumeric
} from '../../../../../../utils/types/plotData';
import {
    round
} from '../../../../../../utils/functions/numberProcessing';
import {
    DataRange
} from '../../../../../../utils/types/display';
import Drawing from '../../Drawing';

export default abstract class PointData<
    DataT extends Point
> extends DrawingData<
    DataT
> {
    protected constructor(
        drawing: Drawing<any, any>,
        data: DataT[]
    ) {
        super(drawing, data);

        for (const [_, y] of data) {
            if (y !== null) {
                this.global.y.min = y < this.global.y.min ? y : this.global.y.min;
                this.global.y.max = this.global.y.max < y ? y : this.global.y.max;
            }
        }
    }

    public override localize(
        range: DataRange
    ) {
        super.localize(range);

        this.local.y = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        };
        const start = Math.floor(this.data.length * range.start),
            end = Math.ceil(this.data.length * range.end);
        for (let i = start; i < end; ++i) {
            const [_, y] = this.data[i];
            if (y !== null) {
                this.local.y.min = y < this.local.y.min ? y : this.local.y.min;
                this.local.y.max = this.local.y.max < y ? y : this.local.y.max;
            }
        }
    }

    public override tooltip(
        localX: number
    ) {
        const i = this.globalize(localX);
        if (i in this.data) {
            const [_, y] = this.data[i];
            return <li key={this.drawing.name} className={'drawing-tooltips'}>
                {this.drawing.name}: {y !== null ? round(y, 2) : '-'}
            </li>;
        }
        return <li key={this.drawing.name} className={'drawing-tooltips'}>
            {this.drawing.name}: -
        </li>;
    }
}
