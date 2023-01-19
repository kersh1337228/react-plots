import React from 'react'
import Drawing from "./Drawing"
import {Point2D, TimeSeriesObject} from "../../utils/types/plotData"
import {Constructor} from "../../utils/types/callable"
import {DataRange} from "../../utils/types/display"
import {numberPower} from "../../utils/functions/numeric"
import {plotDataType} from "../../utils/functions/dataTypes";
import NumberRange from "../../utils/classes/iterable/NumberRange";

export default function DrawingVector<T extends Constructor<Drawing<TimeSeriesObject>>>(Base: T) {
    // @ts-ignore
    return class DrawingVector extends Base {
        public async recalculate_metadata(data_range: DataRange): Promise<void> {
            this.data.observed.full = this.data.full.slice(
                Math.floor(this.data.full.length * data_range.start),
                Math.ceil(this.data.full.length * data_range.end)
            )
            this.data.observed.numeric = Array.from(
                this.data.observed.full, el => el.value
            )
            this.value.y = {
                min: Math.min.apply(null, this.data.observed.numeric as number[]),
                max: Math.max.apply(null, this.data.observed.numeric as number[])
            }
        }
        public point(i: number): Point2D {
            return [i + 0.55, this.data.observed.numeric[i]]
        }
        public show_tooltip(x: number): React.ReactNode {
            if (this.axes) {
                const i = Math.floor(x / this.axes.props.size.width * this.axes.state.data_amount)
                super.draw_tooltip(i)
                const point = this.data.observed.full[i]
                return point.value ? (
                    <span key={this.name} className={'drawingTooltips'}>
                    <ul>
                        {Object.entries(this.data.observed.full[i]).map(([name, value]) =>
                            typeof value === 'number' ?
                                <li>{name}: {numberPower(value, 2)}</li> :
                                <li>{name}: {value}</li>
                        )}
                    </ul>
                </span>
                ) : undefined
            }
        }
    }
}
