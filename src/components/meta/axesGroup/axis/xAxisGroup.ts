import xAxisGroupBase from "./xAxisGroupBase"
import {numberPower} from "../../functions"
import Drawing from "../../drawings/Drawing/Drawing"
import {AxesGroupReal} from "../AxesGroup"

export default class xAxisGroup extends xAxisGroupBase {
    public constructor(axes: AxesGroupReal, label?: string) {
        super(axes, label)
        this.scroll_speed = 100
    }
    public transform_coordinates(drawings: Drawing<any>[]): void {
        super.transform_coordinates(drawings)
        this.coordinates.scale = this.axes.width / this.axes.state.data_amount
    }
    public set_window(): void {
        this.grid.amount = this.axes.state.children.components[0].state.axes.x.grid.amount
        super.set_window()
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
                    const x = (1 - i / (this.grid.amount + 1)) * this.axes.width
                    context.moveTo(x, this.canvases.scale.ref.current.height)
                    context.lineTo(x, this.canvases.scale.ref.current.height * 0.9)
                    context.stroke()
                    context.closePath()
                    // Drawing value
                    context.fillText(
                        numberPower(i * step + this.value.min, 2),
                        x, 48 * 0.05
                    )
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
                context.clearRect(
                    0, 0,
                    this.canvases.tooltip.ref.current.width,
                    this.canvases.tooltip.ref.current.height
                )
                context.save()
                context.fillStyle = '#323232'
                context.fillRect(x - grid_step / 4, 0, 48, grid_step / 2)
                context.font = `${this.font.size}px ${this.font.name}`
                context.fillStyle = '#ffffff'
                // Value tooltip
                context.fillText(numberPower(
                    x / this.coordinates.scale + this.value.min, 2
                ), x, 48 * 0.05)
                context.restore()
            }
        }
    }
}
