import React from 'react'
import Drawing from "./Drawing"
import {DataRange} from "../../utils/types/display"
import {Point2D, TimeSeriesArray} from "../../utils/types/plotData"
import {plotDataType} from "../../utils/functions/dataTypes"
import {Constructor} from "../../utils/types/callable"
import {round} from "../../utils/functions/numeric"

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
        public point(i: number): [number, number] {
            return plotDataType(this.data.full) === 'Point2D' ? [
                (this.data.observed.full[i] as Point2D)[0],
                this.data.observed.numeric[i]
            ] : [i + 0.55, this.data.observed.numeric[i]]
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


