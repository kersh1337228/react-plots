import Drawing from "../../drawings/Drawing/Drawing"
import xAxisGroupBase from "./xAxisGroupBase"
import DateTimeRange, {plotDateTimeRange} from "../../utils/classes/iterable/DateTimeRange"

export default class xAxisDateTimeGroup extends xAxisGroupBase<DateTimeRange> {
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.data.full = plotDateTimeRange(drawings)
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.width / this.axes.state.data_amount
    }
    public async show_scale(): Promise<void> {
        if (this.canvases.scale.ref.current) {
            const context = this.canvases.scale.ref.current.getContext('2d')
            if (context) {
                const step = Math.ceil(this.axes.state.data_amount / this.grid.amount)
                context.save()
                context.clearRect(
                    0, 0,
                    this.canvases.scale.ref.current.width,
                    this.canvases.scale.ref.current.height
                )
                context.font = `${this.font.size}px ${this.font.name}`
                for (let i = step; i < this.axes.state.data_amount - step * 0.5; i += step) {
                    context.beginPath()
                    context.moveTo((i + 0.55) * this.coordinates.scale, 0)
                    context.lineTo(
                        (i + 0.55) * this.coordinates.scale,
                        this.canvases.scale.ref.current.height * 0.1
                    )
                    context.stroke()
                    context.closePath()
                    const text = this.data.observed?.at(i)?.format('%Y-%m-%d')
                    context.textAlign = 'center'
                    context.fillText(
                        text ? text : '',
                        (i + 0.55) * this.coordinates.scale,
                        this.canvases.scale.ref.current.height * 0.3
                    )
                }
                context.restore()
            }
        }
    }
    public async show_tooltip(x: number): Promise<void> {
        const context = this.canvases.tooltip.ref.current?.getContext('2d')
        if (context && this.canvases.tooltip.ref.current) {
            const i = Math.floor(x *
                this.axes.state.children.components[0].state.canvases.plot.density /
                this.coordinates.scale
            )
            // Drawing vertical line
            const axesContext = this.axes.state.tooltip.ref.current?.getContext('2d')
            axesContext?.beginPath()
            axesContext?.moveTo((i + 0.55) * this.coordinates.scale, 0)
            axesContext?.lineTo((i + 0.55) * this.coordinates.scale, this.axes.height)
            axesContext?.stroke()
            axesContext?.beginPath()
            // Drawing tooltip
            context.save()
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.fillStyle = '#323232'
            context.fillRect(Math.min(
                this.axes.width - 60,
                Math.max(0, (i + 0.55) * this.coordinates.scale - 30)
            ), 0, 60, 25)
            context.font = `${this.font.size}px ${this.font.name}`
            context.fillStyle = '#ffffff'
            const text = this.data.observed?.at(i)?.format('%Y-%m-%d')
            context.textAlign = 'center'
            context.fillText(
                text ? text : '',
                Math.min(
                    this.axes.width - 30,
                    Math.max(30, (i + 0.55) * this.coordinates.scale)
                ),
                this.canvases.tooltip.ref.current.height * 0.3
            )
            context.restore()
        }
    }
}
