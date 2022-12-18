import React from "react"
import xAxisBase from "./xAxisBase"
import Drawing from "../../../drawings/Drawing/Drawing"
import {DateString, TimeSeries, Quotes} from "../../../types"
import {plotDateRange} from "../../../functions"
import {AxesReal} from "../../Axes"

export default class xAxisDates extends xAxisBase {
    private dates: { full: DateString[], observed: DateString[] }
    constructor(axes: AxesReal, label?: string) {
        super(axes, label)
        this.dates = { full: [], observed: [] }
    }
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.padded_width / this.axes.state.data_amount
        this.coordinates.translate = this.axes.padding.left * this.axes.width
        this.dates.observed = this.dates.full.slice(
            Math.floor(this.dates.full.length * this.axes.state.data_range.start),
            Math.ceil(this.dates.full.length * this.axes.state.data_range.end)
        )
    }
    // Display
    public set_window(): void {
        this.dates.full = [...plotDateRange(
            this.axes.state.drawings.filter(
                drawing => drawing.visible
            ) as Drawing<TimeSeries | Quotes>[]
        )]
        super.set_window()
    }
    public async show_scale(): Promise<void> {
        const context = this.canvases.scale.ref.current?.getContext('2d')
        if (context && this.canvases.scale.ref.current) {
            context.clearRect(
                0, 0,
                this.canvases.scale.ref.current.width,
                this.canvases.scale.ref.current.height
            )
            const step = Math.ceil(this.axes.state.data_amount * 0.1)
            context.save()
            context.font = '10px Arial'
            const scale = this.coordinates.scale / this.axes.state.canvases.plot.density
            for (let i = step; i <= this.axes.state.data_amount - step * 0.5; i += step) {
                context.beginPath()
                context.moveTo((i + 0.55) * scale, 0)
                context.lineTo(
                    (i + 0.55) * scale,
                    this.canvases.scale.ref.current.height * 0.1
                )
                context.stroke()
                context.closePath()
                context.fillText(
                    this.dates.observed[i],
                    (i + 0.55) * scale - 27,
                    this.canvases.scale.ref.current.height * 0.3
                )
            }
            context.restore()
        }
    }
    public async show_tooltip(x: number): Promise<void> {
        const context = this.canvases.tooltip.ref.current?.getContext('2d')
        if (context && this.canvases.tooltip.ref.current) {
            // Drawing vertical line
            const axesContext = this.axes.state.canvases.tooltip.ref.current?.getContext('2d')
            const segment_width = this.axes.props.size.width * (
                1 - this.axes.padding.left - this.axes.padding.right
            ) / this.axes.state.data_amount
            const i = Math.floor(x * this.axes.state.canvases.plot.density / this.coordinates.scale)
            axesContext?.moveTo((i + 0.55) * this.coordinates.scale, 0)
            axesContext?.lineTo((i + 0.55) * this.coordinates.scale, this.axes.height)
            axesContext?.stroke()
            // Drawing tooltip
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.save()
            context.fillStyle = '#323232'
            context.fillRect(
                (i + 0.55) * segment_width - 30, 0, 60, 25
            )
            context.font = '10px Arial'
            context.fillStyle = '#ffffff'
            context.fillText(
                this.dates.observed[i],
                (i + 0.55) * segment_width - 25,
                this.canvases.tooltip.ref.current.height * 0.3
            )
            context.restore()
        }
    }
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        // TODO: change implementation (probably)
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const [x, y] = [
                event.clientX - window.left,
                event.clientY - window.top
            ]
            const x_offset = (
                this.canvases.tooltip.mouse_events.position.x - x
            ) * this.axes.state.data_amount / 1000000
            if (x_offset) {
                let data_range = {start: 0, end: 1}
                Object.assign(data_range, this.axes.state.data_range)
                if (x_offset < 0) {
                    data_range.start = data_range.start + x_offset <= 0 ?
                        0 : (data_range.end - (data_range.start + x_offset)) * this.axes.total_data_amount > 1000 ?
                            data_range.start : data_range.start + x_offset
                } else if (x_offset > 0) {
                    data_range.start = (data_range.end - (data_range.start + x_offset)) * this.axes.total_data_amount < 5 ?
                        data_range.start : data_range.start + x_offset
                }
                if (data_range.start !== this.axes.state.data_range.start) {
                    await this.axes.recalculate_metadata(data_range, () => {
                        let state = this.axes.state
                        state.axes.x.canvases.tooltip.mouse_events.position = {x, y}
                        this.axes.setState(state, this.axes.plot)
                    })
                }
            }
        }
    }
}
