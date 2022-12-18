import React from "react"
import {HistBase} from "./Hist"
import {DataRange, Quotes} from "../types"
import {round} from "../functions"

export class VolumeHist extends HistBase<Quotes> {
    // Drawing
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        if (data_range) {
            const [start, end] = [
                Math.floor(this.data.full.length * data_range.start),
                Math.ceil(this.data.full.length * data_range.end)
            ]
            this.data.observed.full = this.data.full.slice(start, end)
            const volumes = Array.from(this.data.observed.full, obj => obj.volume)
            this.value.y = {
                min: Math.min.apply(null, volumes),
                max: Math.max.apply(null, volumes)
            }
        }
    }
    public async plot(): Promise<void> {
        const context = this.axes?.state.canvases.plot.ref.current?.getContext('2d')
        if (this.visible && context && this.axes) {
            context.save()
            for (let i = 0; i < this.data_amount; ++i) {
                const {open, close, volume} = this.data.observed.full[i]
                context.fillStyle = close - open > 0 ?
                    this.style.color.pos :
                    this.style.color.neg
                context.fillRect(
                    (i + 0.1) * this.axes.state.axes.x.coordinates.scale,
                    0,
                    this.axes.state.axes.x.coordinates.scale * 0.9,
                    volume
                )
            }
            context.restore()
        }
    }
    // Events
    public show_tooltip(i: number): React.ReactElement {
        const {volume} = this.data.observed.full[i]
        return (
            <span key={this.name}>volume: {
                volume >= 10 ** 9 ?
                    `${round(volume / 10 ** 9, 2)}B` :
                    volume >= 10 ** 6 ?
                        `${round(volume / 10 ** 6, 2)}M` :
                        round(volume, 2)
            }</span>
        )
    }
}
