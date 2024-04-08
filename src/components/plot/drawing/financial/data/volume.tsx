import {
    Quotes
} from '../../../../../utils/types/plotData';
import Drawing from '../../base/Drawing';
import ObjectTimeSeriesData from '../../base/data/object/timeSeries';
import {
    DataRange
} from '../../../../../utils/types/display';
import { numberPower, round } from '../../../../../utils/functions/numberProcessing';

export default class VolumeData extends ObjectTimeSeriesData {
    public constructor(
        drawing: Drawing<any, any>,
        data: Quotes[]
    ) {
        super(drawing, data, 'volume');

        this.global.y.min = 0;
    };

    public override localize(range: DataRange) {
        super.localize(range);

        this.local.y.min = 0;
    }

    public override tooltip(
        localX: number
    ) {
        const i = this.globalize(localX);
        if (i in this.data) {
            const {
                open,
                close,
                volume
            } = this.data[i];
            if (volume !== null) {
                const type = (close as number) < (open as number) ? 'neg' : 'pos';
                return <li key={this.drawing.name} className={'drawing-tooltips'}>
                    volume: <span style={{
                    color: this.drawing.style.color[type]
                }}>
                    {numberPower(volume, 2)}
                </span>
                </li>;
            }
        }
        return <li key={this.drawing.name} className={'drawing-tooltips'}>
            volume: -
        </li>;
    }
};
