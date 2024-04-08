import DrawingData from '../base';
import {
    Object as ObjecT
} from '../../../../../../utils/types/plotData';
import {
    round
} from '../../../../../../utils/functions/numberProcessing';
import {
    DataRange
} from '../../../../../../utils/types/display';
import Drawing from '../../Drawing';

export default abstract class ObjectData<
    DataT extends ObjecT
> extends DrawingData<
    DataT
> {
    protected constructor(
        drawing: Drawing<any, any>,
        data: DataT[],
        protected vField: string,
        protected minField: string = vField,
        protected maxField: string = vField
    ) {
        super(drawing, data);

        this.global.y = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        };
        for (const {
            [minField]: low,
            [maxField]: high
        } of data) {
            if (low !== null && high !== null) {
                this.global.y.min = low < this.global.y.min ? low : this.global.y.min;
                this.global.y.max = this.global.y.max < high ? high : this.global.y.max;
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
            const {
                [this.minField]: low,
                [this.maxField]: high
            } = this.data[i];
            if (low !== null && high !== null) {
                this.local.y.min = low < this.local.y.min ? low : this.local.y.min;
                this.local.y.max = this.local.y.max < high ? high : this.local.y.max;
            }
        }
    }

    public override tooltip(
        localX: number
    ) {
        const point = this.data[this.globalize(localX)];
        return <li key={this.drawing.name} className={'drawing-tooltips'}>
            <ul>
                {Object.entries(point).map(([key, value]) => {
                    return typeof value === 'number' ? <li key={key}>
                        {key}: {round(value, 2)}
                    </li> : null;
                })}
            </ul>
        </li>;
    }
}
