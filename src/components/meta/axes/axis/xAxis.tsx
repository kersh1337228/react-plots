import {AxesReal} from "../Axes"
import Axis from "./Axis"
import {DateString} from "../../types"
import React from "react"

export class xAxis extends Axis {
    public constructor(
        axes: AxesReal,
        public dates: DateString[] = [],
        label?: string
    ) {
        super(axes, label)
    }
    public set_window(): void {
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = this.axes.width
            this.canvases.scale.ref.current.height = 50
            this.canvases.tooltip.ref.current.width = this.axes.width
            this.canvases.tooltip.ref.current.height = 50
        }
    }
    public async show_grid(): Promise<void> {
        const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
        if (context) {
            context.save()
            Object.values(this.grid).forEach(grid => {
                context.beginPath()
                for (let i = 1; i <= grid.amount; ++i) {
                    const x = i * (
                        this.axes.props.size ?
                            this.axes.props.size.width : 0
                    ) / (grid.amount + 1)
                    context.moveTo(x, 0)
                    context.lineTo(x, (
                        this.axes.props.size ?
                            this.axes.props.size.height : 0
                    ))
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
        if (context && this.canvases.scale.ref.current) {
            context.clearRect(
                0, 0,
                this.canvases.scale.ref.current.width,
                this.canvases.scale.ref.current.height
            )
            let step = Math.ceil(this.axes.data_amount * 0.1)
            context.save()
            context.font = '10px Arial'
            for (let i = step; i <= this.axes.data_amount - step * 0.5; i += step) {
                context.beginPath()
                context.moveTo(
                    (2 * i + 1.1) * this.coordinates.scale / 2, 0
                )
                context.lineTo(
                    (2 * i + 1.1) * this.coordinates.scale / 2,
                    this.canvases.scale.ref.current.height * 0.1
                )
                context.stroke()
                context.closePath()
                context.fillText(
                    this.dates[i],
                    (2 * i + 1.1) * this.coordinates.scale / 2 - 27,
                    this.canvases.scale.ref.current.height * 0.3
                )
            }
            context.restore()
        }
    }
    public async show_tooltip(i: number): Promise<void> {
        const context = this.canvases.tooltip.ref.current?.getContext('2d')
        if (context && this.canvases.tooltip.ref.current) {
            context.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
            context.save()
            context.fillStyle = '#323232'
            const segment_width = this.axes.width / this.dates.length
            context.fillRect(
                (2 * i + 1.1) * segment_width / 2 - 30, 0,
                60, 25
            )
            context.font = '10px Arial'
            context.fillStyle = '#ffffff'
            context.fillText(
                this.dates[i],
                (2 * i + 1.1) * segment_width / 2 - 27,
                this.canvases.tooltip.ref.current.height * 0.3
            )
            context.restore()
        }
    }
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const [x, y] = [
                event.clientX - window.left,
                event.clientY - window.top
            ]
            const x_offset = (
                this.canvases.tooltip.mouse_events.position.x - x
            ) * this.axes.data_amount / 1000000
            if (x_offset) {
                let data_range = {start: 0, end: 1}
                Object.assign(data_range, this.axes.state.data_range)
                if (x_offset < 0) {
                    data_range.start = data_range.start + x_offset <= 0 ?
                        0 : (data_range.end - (data_range.start + x_offset)) * this.axes.max_data_amount > 1000 ?
                            data_range.start : data_range.start + x_offset
                } else if (x_offset > 0) {
                    data_range.start = (data_range.end - (data_range.start + x_offset)) * this.axes.max_data_amount < 5 ?
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
    public mouseOutHandler(): void {
        let state = this.axes.state
        state.axes.x.canvases.tooltip.mouse_events.drag = false
        this.axes.setState(state)
    }
    public mouseDownHandler(event: React.MouseEvent): void {
        let state = this.axes.state
        state.axes.x.canvases.tooltip.mouse_events = {
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
        state.axes.x.canvases.tooltip.mouse_events.drag = false
        this.axes.setState(state)
    }
    public render(): React.ReactNode {
        return this.axes.props.xAxis === false ? null :
            <>
                <canvas
                    ref={this.canvases.scale.ref}
                    className={'axes x scale'}
                    style={{
                        width: this.axes.props.size?.width,
                        height: 50
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes x tooltip'}
                    style={{
                        width: this.axes.props.size?.width,
                        height: 50
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
