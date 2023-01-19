import React from "react"
import xAxisBase from "./xAxisBase"
import Drawing from "../../../drawings/Drawing/Drawing"
import DateTimeRange, {plotDateTimeRange} from "../../../utils/classes/iterable/DateTimeRange"

export default class xAxisDateTime extends xAxisBase<DateTimeRange> {
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.data.full = plotDateTimeRange(drawings)
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.padded_width / this.axes.state.data_amount
        this.coordinates.translate = this.axes.padding.left * this.axes.width
    }
    // Display
    public async show_scale(): Promise<void> {
        const [context, gridContext] = [
            this.canvases.scale.ref.current?.getContext('2d'),
            this.axes.state.canvases.plot.ref.current?.getContext('2d')
        ]
        if (context && this.canvases.scale.ref.current || gridContext) {
            const [step, scale] = [
                Math.ceil(this.axes.state.data_amount * 0.15),
                this.coordinates.scale / this.axes.state.canvases.plot.density
            ]
            context?.save()
            context?.clearRect(
                0, 0,
                this.canvases.scale.ref.current?.width as number,
                this.canvases.scale.ref.current?.height as number
            )
            if (context) context.font = `${this.font.size}px ${this.font.name}`
            gridContext?.save()
            if (gridContext) {
                gridContext.lineWidth = this.grid.width
                gridContext.strokeStyle = this.grid.color
            }
            for (let i = step; i < this.axes.state.data_amount - step * 0.7; i += step) {
                context?.beginPath()
                context?.moveTo((i + 0.55) * scale, 0)
                context?.lineTo(
                    (i + 0.55) * scale,
                    (this.canvases.scale.ref.current?.height as number) * 0.1
                )
                context?.stroke()
                context?.closePath()
                gridContext?.beginPath()
                gridContext?.moveTo((i + 0.55) * scale, 0)
                gridContext?.lineTo((i + 0.55) * scale, this.axes.height)
                gridContext?.stroke()
                gridContext?.closePath()
                const text = this.data.observed?.at(i)?.format('%Y-%m-%d')
                if (context) context.textAlign = 'center'
                context?.fillText(
                    text ? text : '',
                    (i + 0.55) * scale,
                    (this.canvases.scale.ref.current?.height as number) * 0.3
                )
            }
            context?.restore()
            gridContext?.restore()
        }
    }
    public async show_tooltip(x: number): Promise<void> {
        if (this.canvases.tooltip.ref.current) {
            const context = this.canvases.tooltip.ref.current.getContext('2d')
            if (context) {
                const [segment_width, i] = [
                    this.axes.props.size.width * (
                        1 - this.axes.padding.left - this.axes.padding.right
                    ) / this.axes.state.data_amount,
                    Math.floor(
                        x * this.axes.state.canvases.plot.density /
                        this.coordinates.scale
                    )
                ]
                // Drawing vertical line
                const axesContext = this.axes.state.canvases.tooltip.ref.current?.getContext('2d')
                axesContext?.beginPath()
                axesContext?.moveTo((i + 0.55) * this.coordinates.scale, 0)
                axesContext?.lineTo((i + 0.55) * this.coordinates.scale, this.axes.height)
                axesContext?.stroke()
                axesContext?.closePath()
                // Drawing tooltip
                context.clearRect(
                    0, 0,
                    this.canvases.tooltip.ref.current.width,
                    this.canvases.tooltip.ref.current.height
                )
                context.save()
                context.fillStyle = '#323232'
                context.fillRect((i + 0.55) * segment_width - 30, 0, 60, 25)
                context.font = `${this.font.size}px ${this.font.name}`
                context.fillStyle = '#ffffff'
                const text = this.data.observed?.at(i)?.format('%Y-%m-%d')
                context.textAlign = 'center'
                context.fillText(
                    text ? text : '',
                    (i + 0.55) * segment_width,
                    this.canvases.tooltip.ref.current.height * 0.3
                )
                context.restore()
            }
        }
    }
}
