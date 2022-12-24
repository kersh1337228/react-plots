import React from 'react'
import {Constructor, DataRange, TimeSeriesObject} from "../../types"
import {numberPower} from "../../functions"
import Drawing from "./Drawing"

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
                min: Math.min.apply(null, this.data.observed.numeric),
                max: Math.max.apply(null, this.data.observed.numeric)
            }
        }
        public point(i: number): [number, number] {
            return [i + 0.55, this.data.observed.numeric[i]]
        }
        public show_tooltip(i: number): React.ReactNode {
            super.draw_tooltip(i)
            return (
                <span key={this.name} className={'drawingTooltips'}>
                    <ul>
                        {Object.entries(this.data.observed.full[i]).map(([name, value]) =>
                            typeof value === 'number' ?
                                <li>{name}: {numberPower(value, 2)}</li> :
                                <li>{name}: {value}</li>
                        )}
                    </ul>
                </span>
            )
        }
    }
}
