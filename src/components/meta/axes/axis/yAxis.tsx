import Axis from "./Axis"
import React from "react";

export class yAxis extends Axis {
    public set_window(): void {
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = 50
            this.canvases.scale.ref.current.height = this.axes.height
            this.canvases.tooltip.ref.current.width = 50
            this.canvases.tooltip.ref.current.height = this.axes.height
        }
    }
    public async show_grid(): Promise<void> {
        const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
        if (context) {
            context.save()
            Object.values(this.grid).forEach(grid => {
                context.beginPath()
                for (let i = 1; i <= grid.amount; ++i) {
                    const y = i * (
                        this.axes.props.size ?
                            this.axes.props.size.height : 0
                    ) / (grid.amount + 1)
                    context.moveTo(0, y)
                    context.lineTo((
                        this.axes.props.size ?
                            this.axes.props.size.width : 0
                    ), y)
                }
                context.lineWidth = grid.width
                context.strokeStyle = grid.color
                context.stroke()
                context.closePath()
            })
            context.restore()
        }
    }
    public async show_scale(): Promise<void> {
        const context = this.canvases.scale.ref.current?.getContext('2d')
        if (context && this.canvases.scale.ref.current) {  // Drawing value scale
            context.clearRect(
                0, 0,
                this.axes.width, this.axes.height
            )
            const step = this.axes.height / (
                this.grid.major.amount + 1
            ) / this.coordinates.scale
            context.save()
            context.font = '10px Arial'
            for (let i = 1; i <= this.grid.major.amount; ++i) {
                context.beginPath()
                const y = (1 - i / (this.grid.major.amount + 1)) * this.axes.height
                context.moveTo(
                    this.canvases.scale.ref.current.width *
                    (1 - (
                        this.axes.props.padding ?
                            this.axes.props.padding.right : 0
                    )), y
                )
                context.lineTo(
                    this.canvases.scale.ref.current.width *
                    (0.9 - (
                        this.axes.props.padding ?
                            this.axes.props.padding.right : 0
                    )), y
                )
                context.stroke()
                context.closePath()
                const min = this.coordinates.translate * (
                    this.axes.spread / this.axes.padded_height - 1 / this.coordinates.scale
                ) + this.axes.min
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
                    String(text), 48 * 0.05, y + 4
                )
            }
            context.restore()
        }
    }
    public async show_tooltip(y: number): Promise<void> {
        const context = this.canvases.tooltip.ref.current?.getContext('2d')
        let grid_step = this.axes.height / this.grid.major.amount
        if (context && this.canvases.tooltip.ref.current) {
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.save()
            context.fillStyle = '#323232'
            context.fillRect(
                0, y - grid_step / 4,
                48, grid_step / 2
            )
            context.font = '10px Arial'
            context.fillStyle = '#ffffff'
            // Value tooltip
            const min = this.coordinates.translate * (
                this.axes.spread / this.axes.padded_height - 1 / this.coordinates.scale
            ) + this.axes.min
            let value: number | string = Math.round(
                (( // dv/dh * (y - hmin) + vmin
                    this.axes.height * (1 - (
                        this.axes.props.padding ?
                            this.axes.props.padding.bottom : 0
                    )) - y) / this.coordinates.scale + min + Number.EPSILON
                ) * 100
            ) / 100
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
                )) * this.axes.spread / 100000
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
                        width: 50,
                        height: this.axes.props.size?.height
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes y tooltip'}
                    style={{
                        width: 50,
                        height: this.axes.props.size?.height
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
