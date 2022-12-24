import React from "react"
import xAxisBase from "./xAxisBase"
import {numberPower} from "../../../functions"
import Drawing from "../../../drawings/Drawing/Drawing"
import {AxesReal} from "../../Axes"

export default class xAxis extends xAxisBase {
    public constructor(axes: AxesReal, label?: string) {
        super(axes, label)
        this.scroll_speed = 100
    }
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.padded_width / this.spread
        this.coordinates.translate =
            -this.min * this.coordinates.scale +
            this.axes.padding.left * this.axes.width
    }
    // Display
    public async show_scale(): Promise<void> {
        // TODO: Show label
        if (this.canvases.scale.ref.current) {
            const context = this.canvases.scale.ref.current.getContext('2d')
            if (context) {  // Drawing value scale
                const step = this.axes.width / (this.grid.amount + 1) / this.coordinates.scale
                context.save()
                context.clearRect(0, 0, this.axes.width, this.axes.height)
                context.font = `${this.font.size}px ${this.font.name}`
                for (let i = 1; i <= this.grid.amount; ++i) {
                    context.beginPath()
                    const x = i / (this.grid.amount + 1) * this.axes.props.size.width
                    context.moveTo(x, 0)
                    context.lineTo(x, this.canvases.scale.ref.current.height * 0.1)
                    context.stroke()
                    context.closePath()
                    // Drawing value
                    context.fillText(numberPower(
                        i * step + this.coordinates.translate * (
                            this.spread / this.axes.padded_width - 1 / this.coordinates.scale
                        ) + this.min - this.axes.padding.right *
                        this.axes.props.size.width / this.coordinates.scale, 2
                    ), x - 10, this.canvases.scale.ref.current.height * 0.3)
                }
                context.restore()
            }
        }
    }
    public async show_tooltip(x: number): Promise<void> {
        if (this.canvases.tooltip.ref.current) {
            const context = this.canvases.tooltip.ref.current.getContext('2d')
            let grid_step = this.axes.width / this.grid.amount
            if (context) {
                // Drawing vertical line
                const axesContext = this.axes.state.canvases.tooltip.ref.current?.getContext('2d')
                axesContext?.save()
                axesContext?.beginPath()
                axesContext?.moveTo(x, 0)
                axesContext?.lineTo(x, this.axes.height)
                axesContext?.stroke()
                axesContext?.closePath()
                axesContext?.restore()
                // Drawing tooltip
                context.clearRect(
                    0, 0,
                    this.canvases.tooltip.ref.current.width,
                    this.canvases.tooltip.ref.current.height
                )
                context.save()
                context.fillStyle = '#323232'
                context.fillRect(x - grid_step / 8, 0, grid_step / 4, 25)
                context.font = `${this.font.size}px ${this.font.name}`
                context.fillStyle = '#ffffff'
                // Value tooltip
                const min = this.coordinates.translate * (
                    this.spread / this.axes.padded_width - 1 / this.coordinates.scale
                ) + this.min
                context.fillText(numberPower(
                    (x - this.axes.width * this.axes.padding.left)
                    / this.coordinates.scale + min, 2
                ), x - 10, this.canvases.tooltip.ref.current.height * 0.3)
                context.restore()
            }
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
            ) * this.axes.state.data_amount / 100000
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
