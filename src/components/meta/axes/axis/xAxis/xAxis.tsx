import {AxesReal} from "../../Axes"
import React from "react"
import xAxisBase from "./xAxisBase"
import {round} from "../../../functions"
import Drawing from "../../../drawings/Drawing/Drawing";

export default class xAxis extends xAxisBase {
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.padded_width / this.spread
        this.coordinates.translate =
            this.max * this.coordinates.scale +
            this.axes.padding.left * this.axes.width
    }
    // Display
    public async show_scale(): Promise<void> {
        // TODO: Show label
        const context = this.canvases.scale.ref.current?.getContext('2d')
        if (context && this.canvases.scale.ref.current) {  // Drawing value scale
            context.clearRect(
                0, 0,
                this.axes.width, this.axes.height
            )
            const step = this.axes.width / (
                this.grid.amount + 1
            ) / this.coordinates.scale
            context.save()
            context.font = '10px Arial'
            for (let i = 1; i <= this.grid.amount; ++i) {
                context.beginPath()
                const x = (1 - i / (this.grid.amount + 1)) * this.axes.width
                context.moveTo(
                    x, this.canvases.scale.ref.current.height *
                    (1 - (
                        this.axes.props.padding ?
                            this.axes.props.padding.bottom : 0
                    ))
                )
                context.lineTo(
                    x, this.canvases.scale.ref.current.height *
                    (0.9 - (
                        this.axes.props.padding ?
                            this.axes.props.padding.bottom : 0
                    ))
                )
                context.stroke()
                context.closePath()
                const min = this.coordinates.translate * (
                    this.spread / this.axes.padded_height - 1 / this.coordinates.scale
                ) + this.min
                // Drawing value
                const value = i * step + min - (
                    this.axes.props.padding ?
                        this.axes.props.padding.bottom : 0
                ) * this.axes.height / this.coordinates.scale
                let text: number | string = Math.round(
                    (value + Number.EPSILON) * 100
                ) / 100
                if (value >= 10 ** 6) {
                    text = `${Math.round(
                        (value / 10 ** 6 + Number.EPSILON) * 100
                    ) / 100}M`
                } else if (value >= 10 ** 9) {
                    text = `${Math.round(
                        (value / 10 ** 9 + Number.EPSILON) * 100
                    ) / 100}B`
                }
                context.fillText(
                    String(text), x, 48 * 0.05
                )
            }
            context.restore()
        }
    }
    public async show_tooltip(x: number): Promise<void> {
        const context = this.canvases.tooltip.ref.current?.getContext('2d')
        let grid_step = this.axes.width / this.grid.amount
        if (context && this.canvases.tooltip.ref.current) {
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.save()
            context.fillStyle = '#323232'
            context.fillRect(
                x - grid_step / 4, 0,
                48, grid_step / 2
            )
            context.font = '10px Arial'
            context.fillStyle = '#ffffff'
            // Value tooltip
            const min = this.coordinates.translate * (
                this.spread / this.axes.padded_width - 1 / this.coordinates.scale
            ) + this.min
            let value: number | string = round(  // dx/dw * (x - wmin) + xmin
                (x - this.axes.width * this.axes.padding.left)
                / this.coordinates.scale + min, 2
            )
            if (value >= 10 ** 6) {
                value = `${Math.round(
                    (value / 10 ** 6 + Number.EPSILON) * 100
                ) / 100}M`
            } else if (value >= 10 ** 9) {
                value = `${Math.round(
                    (value / 10 ** 9 + Number.EPSILON) * 100
                ) / 100}B`
            }
            context.fillText(
                String(value), x + 3, 48 * 0.05
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
