import React from 'react'
import Drawing from "./Drawing"
import {DataRange} from "../../utils/types/display"
import {Point2D, TimeSeriesArray} from "../../utils/types/plotData"
import {Constructor} from "../../utils/types/callable"
import {round} from "../../utils/functions/numeric"
import NumberRange from "../../utils/classes/iterable/NumberRange"

export default function DrawingScalar<T extends Constructor<Drawing<Point2D | TimeSeriesArray>>>(Base: T) {
    // @ts-ignore
    return class DrawingScalar extends Base {
        public async recalculate_metadata(data_range: DataRange): Promise<void> {
            super.recalculate_metadata(data_range)
            const [x, y] = [
                Array.from(this.data.observed as any[], el => el[0]),
                Array.from(this.data.observed as any[], el => el[1])
            ]
            this.value.y = {
                min: Math.min.apply(null, y),
                max: Math.max.apply(null, y)
            }
            this.value.x = this.dataType === 'Point2D' ? {
                min: Math.min.apply(null, x),
                max: Math.max.apply(null, x),
            } : { min: 0, max: 0 }
        }
        public point(i: number): Point2D {
            let coordinates = this.data.observed[i] as Point2D
            return this.dataType === 'Point2D' ?
                coordinates : [i + 0.55, coordinates[1]]
        }
        public show_tooltip(x: number): React.ReactNode {
            if (this.axes) {
                const i = this.dataType === 'Point2D' ?
                    (this.axes.state.axes.x.data.observed as NumberRange).indexOf(
                        (x - this.axes.state.axes.x.coordinates.translate) /
                        this.axes.state.axes.x.coordinates.scale
                    ) as number : Math.floor(
                        x / this.axes.props.size.width * this.axes.state.data_amount
                    )
                super.draw_tooltip(i)
                const coordinates = this.point(i)
                return coordinates[1] !== null ? (
                    <span key={this.name} className={'drawingTooltips'}>
                        {this.name}: {round(coordinates[1] as number, 2)}
                    </span>
                ) : undefined
            }
        }
    }
}


