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
        this.coordinates.scale = this.axes.padded_height / this.spread
        this.coordinates.translate =
            this.axes.padding.top * this.axes.height +
            this.max * this.coordinates.scale
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
        // TODO: Show label
        if (this.canvases.scale.ref.current) {
            const [context, gridContext] = [
                this.canvases.scale.ref.current.getContext('2d'),
                this.axes.state.canvases.plot.ref.current?.getContext('2d')
            ]
            if (context && gridContext) {  // Drawing value scale
                const step = this.axes.height / (this.grid.amount + 1) / this.coordinates.scale
                context.save()
                gridContext.save()
                gridContext.lineWidth = this.grid.width
                gridContext.strokeStyle = this.grid.color
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
                    context.fillText(
                        String(numberPower(
                            i * step + this.coordinates.translate * (
                                this.spread / this.axes.padded_height - 1 / this.coordinates.scale
                            ) + this.min - this.axes.padding.bottom *
                            this.axes.props.size.height / this.coordinates.scale, 2
                        )), 48 * 0.05, y + 4
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
            const min = this.coordinates.translate * (
                this.spread / this.axes.padded_height - 1 / this.coordinates.scale
            ) + this.min
            let value: number | string = round(  // dy/dh * (y - hmin) + ymin
                (this.axes.height * (
                    1 - this.axes.padding.bottom
                ) - y * this.axes.state.canvases.plot.density) /
                this.coordinates.scale + min, 2
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
                String(value), 48 * 0.05, y + 3
            )
            context.restore()
        }
    }
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const y_offset = (
                this.canvases.tooltip.mouse_events.position.y - (
                    event.clientY - window.top
                )) / this.spread
            if (y_offset) {
                let state = this.axes.state
                state.axes.y.coordinates.scale = this.coordinates.scale + y_offset > 0 ?
                    this.coordinates.scale + y_offset : this.coordinates.scale
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
