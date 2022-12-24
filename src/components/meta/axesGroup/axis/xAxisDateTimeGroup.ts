import {Quotes, TimeSeries} from "../../types"
import {AxesGroupReal} from "../AxesGroup"
import Drawing from "../../drawings/Drawing/Drawing"
import {plotDateRange} from "../../functions"
import xAxisGroupBase from "./xAxisGroupBase"

export default class xAxisDateTimeGroup extends xAxisGroupBase {
    private timestamps: { full: string[], observed: string[] }
    public constructor(
        axes: AxesGroupReal,
        label?: string
    ) {
        super(axes, label)
        this.timestamps = { full: [], observed: [] }
    }
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.width / this.axes.state.data_amount
        this.timestamps.observed = this.timestamps.full.slice(
            Math.floor(this.timestamps.full.length * this.axes.state.data_range.start),
            Math.ceil(this.timestamps.full.length * this.axes.state.data_range.end)
        )
    }
    public set_window(): void {
        this.timestamps.full = plotDateRange(
            ([] as Array<Drawing<TimeSeries | Quotes>>).concat(
                ...this.axes.state.children.components.map(
                    axes => axes.state.drawings.filter(
                        drawing => drawing.visible
                    ) as Drawing<TimeSeries | Quotes>[]
                ))
        ).format('%Y-%m-%d')
        super.set_window()
    }
    public async show_scale(): Promise<void> {
        // TODO: Show label
        if (this.canvases.scale.ref.current) {
            const context = this.canvases.scale.ref.current.getContext('2d')
            if (context) {
                const step = Math.ceil(this.axes.state.data_amount * 0.1)
                context.save()
                context.clearRect(
                    0, 0,
                    this.canvases.scale.ref.current.width,
                    this.canvases.scale.ref.current.height
                )
                context.font = `${this.font.size}px ${this.font.name}`
                for (let i = step; i <= this.axes.state.data_amount - step * 0.5; i += step) {
                    context.beginPath()
                    context.moveTo((i + 0.55) * this.coordinates.scale, 0)
                    context.lineTo(
                        (i + 0.55) * this.coordinates.scale,
                        this.canvases.scale.ref.current.height * 0.1
                    )
                    context.stroke()
                    context.closePath()
                    context.fillText(
                        this.timestamps.observed[i], (i + 0.55) * this.coordinates.scale - 25,
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
            axesContext?.save()
            axesContext?.beginPath()
            axesContext?.moveTo((i + 0.55) * this.coordinates.scale, 0)
            axesContext?.lineTo((i + 0.55) * this.coordinates.scale, this.axes.height)
            axesContext?.stroke()
            axesContext?.beginPath()
            axesContext?.restore()
            // Drawing tooltip
            context.save()
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.fillStyle = '#323232'
            context.fillRect((i + 0.55) * this.coordinates.scale - 30, 0, 60, 25)
            context.font = `${this.font.size}px ${this.font.name}`
            context.fillStyle = '#ffffff'
            context.fillText(
                this.timestamps.observed[i], (i + 0.55) * this.coordinates.scale - 26,
                this.canvases.tooltip.ref.current.height * 0.3
            )
            context.restore()
        }
    }
}
