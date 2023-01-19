import React from "react"
import {HistBase} from "./Hist"
import {Quotes} from "../utils/types/plotData"
import {DataRange} from "../utils/types/display"
import {numberPower} from "../utils/functions/numeric"

export class VolumeHist extends HistBase<Quotes> {
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        const [start, end] = [
            Math.floor(this.data.full.length * data_range.start),
            Math.ceil(this.data.full.length * data_range.end)
        ]
        this.data.observed.full = this.data.full.slice(start, end)
        const volumes = Array.from(this.data.observed.full, obj => obj.volume)
        this.value.y = {
            min: Math.min.apply(null, volumes as number[]),
            max: Math.max.apply(null, volumes as number[])
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
                    -this.axes.state.axes.y.coordinates.scale
                )
                // Drawing
                for (let i = 0; i < this.data_amount; ++i) {
                    const {open, close, volume} = this.data.observed.full[i]
                    if (open && close && volume) {
                        context.fillStyle = close - open > 0 ?
                            this.style.color.pos : this.style.color.neg
                        context.fillRect(i + 0.1, 0, 0.9, volume)
                    }
                }
                context.restore()
            }
        }
    }
    public show_tooltip(i: number): React.ReactNode {
        const volume = this.data.observed.full[i].volume
        return volume ? (
            <span key={this.name}>volume: {
                numberPower(volume, 2)
            }</span>
        ) : undefined
    }
}
