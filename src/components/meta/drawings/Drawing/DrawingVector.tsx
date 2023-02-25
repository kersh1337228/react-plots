import React from 'react'
import Drawing from "./Drawing"
import {Point2D, TimeSeriesObject} from "../../utils/types/plotData"
import {Constructor} from "../../utils/types/callable"
import {DataRange} from "../../utils/types/display"
import {numberPower} from "../../utils/functions/numeric"

export default function DrawingVector<T extends Constructor<Drawing<TimeSeriesObject>>>(Base: T) {
    // @ts-ignore
    return class DrawingVector extends Base {
        public async recalculate_metadata(data_range: DataRange): Promise<void> {
            super.recalculate_metadata(data_range)
            const y = Array.from(this.data.observed, point => point.value) as number[]
            this.value.y = {
                min: Math.min.apply(null, y),
                max: Math.max.apply(null, y)
            }
        }
        public point(i: number): Point2D {
            return [i + 0.55, Array.from(this.data.observed, point => point.value)[i]]
        }
        public show_tooltip(x: number): React.ReactNode {
            if (this.axes) {
                const i = Math.floor(x / this.axes.props.size.width * this.axes.state.data_amount)
                super.draw_tooltip(i)
                const point = this.data.observed[i]
                return point.value ? (
                    <span key={this.name} className={'drawingTooltips'}>
                        <ul>
                            {Object.entries(point).map(([name, value]) =>
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
