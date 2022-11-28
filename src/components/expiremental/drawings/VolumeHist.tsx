import Hist, {HistStyle} from "./Hist"
import {DataRange, PlotData} from "../types"
import React from "react"

export class VolumeHist extends Hist {
    public constructor(
        name: string,
        data: PlotData,
        style?: HistStyle
    ) {
        super(name, data)
        this.style = style ? style : {
            color: {pos: '#53e9b5', neg: '#da2c4d'}
        }
    }
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        if (data_range) {
            const [start, end] = [
                Math.floor(this.data.length * data_range.start),
                Math.ceil(this.data.length * data_range.end)
            ]
            this.meta_data.observed_data = this.data.slice(start, end)
            this.meta_data.value.min = Math.min.apply(
                null, Array.from(
                    this.meta_data.observed_data,
                        obj => obj.volume
                )
            )
            this.meta_data.value.max = Math.max.apply(
                null, Array.from(
                    this.meta_data.observed_data,
                        obj => obj.volume
                )
            )
        }
    }
    public async plot(): Promise<void> {
        const context = this.axes?.state.canvases.plot.ref.current?.getContext('2d')
        if (this.visible && context && this.axes) {
            context.save()
            for (let i = 0; i < this.data_amount; ++i) {
                const {open, close, volume} = this.meta_data.observed_data[i]
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
    public show_tooltip(i: number): React.ReactElement {
        let {volume} = this.meta_data.observed_data[i]
        if (volume >= 10 ** 6) {
            volume = `${Math.round((
                volume / 10 ** 6 + Number.EPSILON
            ) * 100) / 100}M`
        } else if (volume >= 10 ** 9) {
            volume = `${Math.round((
                volume / 10 ** 9 + Number.EPSILON
            ) * 100) / 100}B`
        } else {
            volume = Math.round((
                volume / 10 ** 9 + Number.EPSILON
            ) * 100) / 100
        }
        return (
            <span key={this.name}>volume: {volume}</span>
        )
    }
}
