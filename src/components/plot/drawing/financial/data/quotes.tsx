import {
    Quotes
} from '../../../../../utils/types/plotData';
import Drawing from '../../base/Drawing';
import ObjectTimeSeriesData from '../../base/data/object/timeSeries';
import {
    round
} from '../../../../../utils/functions/numberProcessing';

export default class QuotesData extends ObjectTimeSeriesData {
    public constructor(
        drawing: Drawing<any, any>,
        data: Quotes[]
    ) {
        super(drawing, data, 'close', 'low', 'high');
    };

    public override tooltip(
        localX: number
    ) {
        const i = this.globalize(localX);
        if (i in this.data) {
            const {
                open,
                high,
                low,
                close
            } = this.data[i];
            if (close !== null) {
                const type = (close as number) < (open as number) ? 'neg' : 'pos';
                return <li key={this.drawing.name} className={'drawing-tooltips'}>
                    <ul>
                        <li>
                            open: <span style={{
                            color: this.drawing.style.color[type]
                        }}>
                            {round(open as number, 2)}
                        </span>
                        </li>
                        <li>
                            high: <span style={{
                            color: this.drawing.style.color[type]
                        }}>
                            {round(high as number, 2)}
                        </span>
                        </li>
                        <li>
                            low: <span style={{
                            color: this.drawing.style.color[type]
                        }}>
                            {round(low as number, 2)}
                        </span>
                        </li>
                        <li>
                            close: <span style={{
                            color: this.drawing.style.color[type]
                        }}>
                            {round(close as number, 2)}
                        </span>
                        </li>
                    </ul>
                </li>;
            }
        }
        return <li key={this.drawing.name} className={'drawing-tooltips'}>
            <ul>
                <li>open: -</li>
                <li>high: -</li>
                <li>low: -</li>
                <li>close: -</li>
            </ul>
        </li>;
    }
};
