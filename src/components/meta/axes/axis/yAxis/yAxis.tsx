import React from "react"
import Axis from "../Axis"
import Drawing from "../../../drawings/Drawing/Drawing"
import {axisSize} from "../../../Figure/Figure"
import {AxesReal} from "../../Axes"
import {numberPower, round} from "../../../utils/functions/numeric"

export default class yAxis extends Axis<AxesReal> {
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.value.min = Math.min.apply(null, drawings.map(drawing => drawing.min('y')))
        this.value.max = Math.max.apply(null, drawings.map(drawing => drawing.max('y')))
        // y-axis top window bottom and bottom is window top
        this.coordinates.scale = -this.axes.padded_height / this.spread  // (a - b) / (max - min)
        this.coordinates.translate = this.axes.top - this.coordinates.scale * this.min  // b - (a - b) / (max - min) * min
    }
    // Display
    public set_window(): void {
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = axisSize.y
            this.canvases.scale.ref.current.height = this.axes.props.size.height
            this.canvases.tooltip.ref.current.width = axisSize.y
            this.canvases.tooltip.ref.current.height = this.axes.props.size.height
        }
    }
    public async show_scale(): Promise<void> {
        if (this.canvases.scale.ref.current) {
            const [context, gridContext] = [
                this.canvases.scale.ref.current.getContext('2d'),
                this.axes.state.canvases.plot.ref.current?.getContext('2d')
            ]
            if (context && gridContext) {  // Drawing value scale
                gridContext.save()
                gridContext.strokeStyle = this.grid.color
                gridContext.lineWidth = this.grid.width
                gridContext.strokeStyle = this.grid.color
                context.save()
                context.clearRect(0, 0, this.axes.props.size.width, this.axes.props.size.height)
                context.font = `${this.font.size}px ${this.font.name}`
                for (let i = 1; i <= this.grid.amount; ++i) {
                    context.beginPath()
                    const y = (1 - i / (this.grid.amount + 1)) * this.axes.props.size.height
                    context.moveTo(
                        this.canvases.scale.ref.current.width *
                        (1 - this.axes.padding.right), y
                    )
                    context.lineTo(
                        this.canvases.scale.ref.current.width *
                        (0.9 - (this.axes.padding.right)), y
                    )
                    context.stroke()
                    context.closePath()
                    gridContext.beginPath()
                    gridContext.moveTo(0, y)
                    gridContext.lineTo(this.axes.width, y)
                    gridContext.stroke()
                    gridContext.closePath()
                    // Drawing value
                    context.textAlign = 'right'
                    const dyt = (-this.axes.height / this.spread - this.coordinates.scale) * this.spread
                    const value = numberPower(
                        this.min + dyt / 2 / this.coordinates.scale -
                        (this.axes.height + dyt - y) / this.coordinates.scale,
                        2
                    )
                    context.fillText(
                        value, axisSize.y * 0.85, y + 4
                    )
                }
                context.restore()
                gridContext.restore()
            }
        }
    }
    public async show_tooltip(y: number): Promise<void> {
        const context = this.canvases.tooltip.ref.current?.getContext('2d')
        let grid_step = this.axes.props.size.height / this.grid.amount
        if (context && this.canvases.tooltip.ref.current) {
            // Drawing horizontal line
            const axesContext = this.axes.state.canvases.tooltip.ref.current?.getContext('2d')
            axesContext?.beginPath()
            axesContext?.moveTo(0, y * this.axes.state.canvases.plot.density)
            axesContext?.lineTo(this.axes.width, y * this.axes.state.canvases.plot.density)
            axesContext?.stroke()
            axesContext?.closePath()
            // Drawing tooltip
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.fillStyle = '#323232'
            context.fillRect(
                0, y - grid_step / 4,
                48, grid_step / 2
            )
            context.font = `${this.font.size}px ${this.font.name}`
            context.fillStyle = '#ffffff'
            // Value tooltip
            const dyt = (-this.axes.height / this.spread - this.coordinates.scale) * this.spread
            const value = numberPower(
                this.min + dyt / 2 / this.coordinates.scale -
                (this.axes.height + dyt - y) / this.coordinates.scale,
                2
            )
            context.fillText(
                value, 48 * 0.05, y + 3
            )
            context.restore()
        }
    }
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const normal_scale = -this.axes.padded_height / this.spread
            const dy = (
                this.canvases.tooltip.mouse_events.position.y - (
                    event.clientY - window.top
                )
            ) * this.scroll_speed * this.spread
                // * -normal_scale
            if (dy) {
                const dyt = (normal_scale - this.coordinates.scale) * this.spread + dy / this.spread
                let state = this.axes.state
                state.axes.y.coordinates.scale = normal_scale - dyt / this.spread < 0 ?
                    normal_scale - dyt / this.spread :
                    this.coordinates.scale
                state.axes.y.coordinates.translate = normal_scale - dyt / this.spread < 0 ?
                    this.axes.top + dyt / 2 - state.axes.y.coordinates.scale * this.min :
                    this.coordinates.translate
                state.axes.y.canvases.tooltip.mouse_events.position = {
                    x: event.clientX - window.left,
                    y: event.clientY - window.top,
                }
                this.axes.setState(state, this.axes.plot)
            }
        }
    }
    public mouseOutHandler(): void {
        let state = this.axes.state
        state.axes.y.canvases.tooltip.mouse_events.drag = false
        this.axes.setState(state)
    }
    public mouseDownHandler(event: React.MouseEvent): void {
        let state = this.axes.state
        state.axes.y.canvases.tooltip.mouse_events = {
            drag: true,
            position: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            }
        }
        this.axes.setState(state)
    }
    public mouseUpHandler(): void {
        let state = this.axes.state
        state.axes.y.canvases.tooltip.mouse_events.drag = false
        this.axes.setState(state)
    }
    public render(): React.ReactNode {
        return this.axes.props.yAxis === false ? null :
            <>
                <canvas
                    ref={this.canvases.scale.ref}
                    className={'axes y scale'}
                    style={{
                        width: axisSize.y,
                        height: this.axes.props.size.height
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes y tooltip'}
                    style={{
                        width: axisSize.y,
                        height: this.axes.props.size.height
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
