import DrawingData from '../base';
import {
    Object as ObjecT
} from '../../../../../../utils/types/plotData';
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
        const i = this.globalize(localX);
        if (i in this.data) {
            const point = this.data[i];
            return <li key={this.drawing.name} className={'drawing-tooltips'}>
                <ul>
                    {Object.entries(point).map(([key, value]) =>
                        key !== 'timestamp' ? <li key={key}>
                            {key}: {typeof value === 'number' ?
                            value.toFixed(2) : typeof value === 'string' ?
                                value : '-'}
                        </li> : null
                    )}
                </ul>
            </li>;
        }
        const point = this.data[0];
        return <li key={this.drawing.name} className={'drawing-tooltips'}>
            <ul>
                {Object.entries(point).map(([key, _]) =>
                    key !== 'timestamp' ? <li key={key}>
                        {key}: -
                    </li> : null
                )}
            </ul>
        </li>;
    }
}
