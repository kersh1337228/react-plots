import Axis from "../Axis"
import React from "react"
import Drawing from "../../../drawings/Drawing/Drawing"
import {axisSize} from "../../../Figure/Figure"
import {AxesReal} from "../../Axes"
import NumberRange from "../../../utils/classes/iterable/NumberRange"
import DateTimeRange from "../../../utils/classes/iterable/DateTimeRange"

export default abstract class xAxisBase<T extends NumberRange | DateTimeRange> extends Axis<AxesReal> {
    protected data: { full: T | undefined, observed: T | undefined}
    constructor(axes: AxesReal, label?: string) {
        super(axes, label)
        this.data = { full: undefined, observed: undefined }
    }
    // Coordinates transform
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.data.observed = this.data.full?.slice(
            Math.floor(this.data.full?.length * this.axes.state.data_range.start),
            Math.ceil(this.data.full?.length * this.axes.state.data_range.end)
        ) as T
        this.value.min = Math.min.apply(null, drawings.map(drawing => drawing.min('x')))
        this.value.max = Math.max.apply(null, drawings.map(drawing => drawing.max('x')))
    }
    // Display
    public set_window(): void {
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = this.axes.props.size.width
            this.canvases.scale.ref.current.height = axisSize.x
            this.canvases.tooltip.ref.current.width = this.axes.props.size.width
            this.canvases.tooltip.ref.current.height = axisSize.x
        }
    }
    public async show_grid(): Promise<void> {
        const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
        if (context) {
            context.save()
            context.beginPath()
            for (let i = 1; i <= this.grid.amount; ++i) {
                const x = i * this.axes.width / (this.grid.amount + 1)
                context.moveTo(x, 0)
                context.lineTo(x, this.axes.height)
            }
            context.lineWidth = this.grid.width
            context.strokeStyle = this.grid.color
            context.stroke()
            context.closePath()
            context.restore()
        }
    }
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        // TODO: change implementation (probably)
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const [x, y] = [
                event.clientX - window.left,
                event.clientY - window.top
            ]
            const x_offset = (
                this.canvases.tooltip.mouse_events.position.x - x
            ) * 0.001 / this.coordinates.scale * this.scroll_speed
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
                        height: axisSize.x
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes x tooltip'}
                    style={{
                        width: this.axes.props.size?.width,
                        height: axisSize.x
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
