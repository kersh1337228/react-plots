import React from "react"
import xAxisBase from "./xAxisBase"
import Drawing from "../../../drawings/Drawing/Drawing"
import {AxesReal} from "../../Axes"
import NumberRange, {plotNumberRange} from "../../../utils/classes/iterable/NumberRange"
import {numberPower} from "../../../utils/functions/numeric"

export default class xAxis extends xAxisBase<NumberRange> {
    public constructor(axes: AxesReal, label?: string) {
        super(axes, label)
        this.scroll_speed = 100
    }
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.data.full = plotNumberRange(drawings)
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.padded_width / this.spread
        this.coordinates.translate =
            -this.min * this.coordinates.scale +
            this.axes.padding.left * this.axes.width
    }
    // Display
    public async show_scale(): Promise<void> {
        // TODO: Show label
        const [context, gridContext] = [
            this.canvases.scale.ref.current?.getContext('2d'),
            this.axes.state.canvases.plot.ref.current?.getContext('2d')
        ]
        if (context && this.canvases.scale.ref.current || gridContext) {  // Drawing value scale
            const step = this.axes.width / (this.grid.amount + 1) / this.coordinates.scale
            context?.save()
            context?.clearRect(0, 0, this.axes.width, this.axes.height)
            if (context) context.font = `${this.font.size}px ${this.font.name}`
            gridContext?.save()
            if (gridContext) {
                gridContext.lineWidth = this.grid.width
                gridContext.strokeStyle = this.grid.color
            }
            for (let i = 1; i <= this.grid.amount; ++i) {
                const x = i / (this.grid.amount + 1) * this.axes.props.size.width
                context?.beginPath()
                context?.moveTo(x, 0)
                context?.lineTo(x, (this.canvases.scale.ref.current?.height as number) * 0.1)
                context?.stroke()
                context?.closePath()
                gridContext?.beginPath()
                gridContext?.moveTo(x, 0)
                gridContext?.lineTo(x, this.axes.height)
                gridContext?.stroke()
                gridContext?.closePath()
                // Drawing value
                if (context) context.textAlign = 'center'
                context?.fillText(numberPower(
                    i * step + this.coordinates.translate * (
                        this.spread / this.axes.padded_width - 1 / this.coordinates.scale
                    ) + this.min - this.axes.padding.right *
                    this.axes.props.size.width / this.coordinates.scale, 2
                ), x, (this.canvases.scale.ref.current?.height as number) * 0.3)
            }
            context?.restore()
            gridContext?.restore()
        }
    }
    public async show_tooltip(x: number): Promise<void> {
        if (this.canvases.tooltip.ref.current) {
            const context = this.canvases.tooltip.ref.current.getContext('2d')
            if (context) {
                const i = (this.data.observed as NumberRange).indexOf(
                    (x - this.coordinates.translate) / this.coordinates.scale
                ) as number
                const xi = this.data.observed?.at(i) as number
                // Drawing vertical line
                const axesContext = this.axes.state.canvases.tooltip.ref.current?.getContext('2d')
                axesContext?.beginPath()
                axesContext?.moveTo(xi * this.coordinates.scale + this.coordinates.translate, 0)
                axesContext?.lineTo(xi * this.coordinates.scale + this.coordinates.translate, this.axes.height)
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
                context.fillRect(xi * this.coordinates.scale + this.coordinates.translate - 15, 0, 30, 25)
                context.font = `${this.font.size}px ${this.font.name}`
                context.fillStyle = '#ffffff'
                const text = this.data.observed?.format('%.2f').at(i)
                context.textAlign = 'center'
                context.fillText(
                    text ? text : '',
                    xi * this.coordinates.scale + this.coordinates.translate,
                    this.canvases.tooltip.ref.current.height * 0.3
                )
                context.restore()
            }
        }
    }
}
