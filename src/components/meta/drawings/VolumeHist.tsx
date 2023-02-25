import React from "react"
import {HistBase} from "./Hist"
import {Quotes} from "../utils/types/plotData"
import {DataRange} from "../utils/types/display"
import {numberPower} from "../utils/functions/numeric"

export class VolumeHist extends HistBase<Quotes> {
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        super.recalculate_metadata(data_range)
        const volumes = Array.from(this.data.observed, obj => obj.volume) as number[]
        this.value.y = {
            min: Math.min.apply(null, volumes),
            max: Math.max.apply(null, volumes)
        }
    }
    public async plot(): Promise<void> {
        if (this.axes) {
            const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
            if (this.visible && context) {
                // Transforming coordinates
                context.save()
                context.translate(
                    this.axes.state.axes.x.coordinates.translate,
                    this.axes.state.axes.y.coordinates.translate
                )
                context.scale(
                    this.axes.state.axes.x.coordinates.scale,
                    this.axes.state.axes.y.coordinates.scale
                )
                // Drawing
                for (let i = 0; i < this.data_amount; ++i) {
                    const {open, close, volume} = this.data.observed[i]
                    if (open !== null && close !== null && volume !== null) {
                        context.fillStyle = close - open > 0 ?
                            this.style.color.pos : this.style.color.neg
                        context.fillRect(i + 0.1, 0, 0.9, volume)
                    }
                }
                context.restore()
            }
        }
    }
    public show_tooltip(x: number): React.ReactNode {
        if (this.axes) {
            const i = Math.floor(x / this.axes.props.size.width * this.axes.state.data_amount)
            const volume = this.data.observed[i].volume
            return volume ? (
                <span key={this.name}>volume: {
                    numberPower(volume, 2)
                }</span>
            ) : undefined
        }
    }
}
