import React from 'react'
import Drawing from "./Drawing"
import {DataRange} from "../../utils/types/display"
import {Point2D, TimeSeriesArray} from "../../utils/types/plotData"
import {plotDataType} from "../../utils/functions/dataTypes"
import {Constructor} from "../../utils/types/callable"
import {round} from "../../utils/functions/numeric"
import NumberRange from "../../utils/classes/iterable/NumberRange";

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
                min: Math.min.apply(null, this.data.observed.numeric as number[]),
                max: Math.max.apply(null, this.data.observed.numeric as number[])
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
        public point(i: number): Point2D {
            return plotDataType(this.data.full) === 'Point2D' ? [
                (this.data.observed.full[i] as Point2D)[0],
                this.data.observed.numeric[i]
            ] : [i + 0.55, this.data.observed.numeric[i]]
        }
        public show_tooltip(x: number): React.ReactNode {
            if (this.axes) {
                const i = plotDataType(this.data.full) === 'Point2D' ?
                    (this.axes.state.axes.x.data.observed as NumberRange).indexOf(
                        (x - this.axes.state.axes.x.coordinates.translate) / this.axes.state.axes.x.coordinates.scale
                    ) as number :
                    Math.floor(x / this.axes.props.size.width * this.axes.state.data_amount)
                super.draw_tooltip(i)
                return this.data.observed.numeric[i] ? (
                    <span key={this.name} className={'drawingTooltips'}>
                    {this.name}: {round(this.data.observed.numeric[i] as number, 2)}
                </span>
                ) : undefined
            }
        }
    }
}


