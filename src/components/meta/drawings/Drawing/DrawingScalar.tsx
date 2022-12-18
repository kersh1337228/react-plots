import React from 'react'
import {Constructor, DataRange, Point2D, TimeSeriesArray} from "../../types"
import {plotDataType, round} from "../../functions"
import Drawing from "./Drawing"

export default function DrawingScalar<T extends Constructor<Drawing<Point2D | TimeSeriesArray>>>(Base: T) {
    // @ts-ignore
    return class DrawingScalar extends Base {
        public async recalculate_metadata(data_range: DataRange): Promise<void> {
            this.data.observed.full = this.data.full.slice(
                Math.floor(this.data.full.length * data_range.start),
                Math.ceil(this.data.full.length * data_range.end)
            )
            this.data.observed.numeric = Array.from(
                this.data.observed.full, el => el[1]
            )
            this.value.y = {
                min: Math.min.apply(null, this.data.observed.numeric),
                max: Math.max.apply(null, this.data.observed.numeric)
            }
            this.value.x = plotDataType(this.data.full) === 'Point2D' ? {
                min: Math.min.apply(null, Array.from(
                    this.data.observed.full as Point2D[], el => el[0]
                )),
                max: Math.max.apply(null, Array.from(
                    this.data.observed.full as Point2D[], el => el[0]
                )),
            } : { min: 0, max: 0 }
        }
        public show_tooltip(i: number): React.ReactNode {
            super.draw_tooltip(i)
            return (
                <span key={this.name} className={'drawingTooltips'}>
                    {this.name}: {round(this.data.observed.numeric[i], 2)}
                </span>
            )
        }
    }
}


