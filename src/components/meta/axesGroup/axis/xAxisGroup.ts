import xAxisGroupBase from "./xAxisGroupBase"
import Drawing from "../../drawings/Drawing/Drawing"
import {AxesGroupReal} from "../AxesGroup"
import {numberPower} from "../../utils/functions/numeric"
import NumberRange, {plotNumberRange} from "../../utils/classes/iterable/NumberRange"

export default class xAxisGroup extends xAxisGroupBase<NumberRange> {
    public constructor(axes: AxesGroupReal, label?: string) {
        super(axes, label)
        this.scroll_speed = 100
    }
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.data.full = plotNumberRange(drawings)
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.width / this.spread
        this.coordinates.translate = -this.min * this.coordinates.scale
    }
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
                    const x = i / (this.grid.amount + 1) * this.axes.width
                    context.moveTo(x, 0)
                    context.lineTo(x, this.canvases.scale.ref.current.height * 0.1)
                    context.stroke()
                    context.closePath()
                    // Drawing value
                    context.textAlign = 'center'
                    context.fillText(numberPower(
                        i * step + this.coordinates.translate * (
                            this.spread / this.axes.width - 1 / this.coordinates.scale
                        ) + this.min, 2
                    ), x, this.canvases.scale.ref.current.height * 0.3)
                }
                context.restore()
            }
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
                const axesContext = this.axes.state.tooltip.ref.current?.getContext('2d')
                axesContext?.beginPath()
                axesContext?.moveTo(xi * this.coordinates.scale + this.coordinates.translate, 0)
                axesContext?.lineTo(xi * this.coordinates.scale + this.coordinates.translate, this.axes.height)
                axesContext?.stroke()
                axesContext?.beginPath()
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
                // Value tooltip
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
