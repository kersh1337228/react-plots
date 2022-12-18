import React from "react"
import {CanvasObject, DateString, GridObject, Quotes, TimeSeries, TooltipCanvasObject} from "../../types"
import {AxesGroupReal} from "../AxesGroup"
import Drawing from "../../drawings/Drawing/Drawing"
import {plotDateRange} from "../../functions"

export class xAxisGroup {
    // Fields
    public scale: number
    public grid: GridObject
    public readonly canvases: { scale: CanvasObject, tooltip: TooltipCanvasObject }
    private dates: DateString[] // Metadata with available dates list
    // Methods
    public constructor(
        protected readonly axesGroup: AxesGroupReal,
        public readonly label?: string
    ) {
        this.scale = 1
        this.grid = {
            amount: 10,
            color: '#d9d9d9',
            width: 1
        }
        this.canvases = {
            scale: {
                ref: React.createRef(),
                density: 1
            },
            tooltip: {
                ref: React.createRef(),
                mouse_events: {
                    drag: false,
                    position: {
                        x: 0, y: 0
                    }
                }
            }
        }
        this.dates = []
        // Methods binding
        this.show_scale = this.show_scale.bind(this)
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    // Display
    public set_window(): void {
        this.dates = [...plotDateRange(
            ([] as Array<Drawing<TimeSeries | Quotes>>).concat(
                ...this.axesGroup.state.children.components.map(
                    axes => axes.state.drawings.filter(
                        drawing => drawing.visible
                    ) as Drawing<TimeSeries | Quotes>[]
                ))
        )]
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = this.axesGroup.width
            this.canvases.scale.ref.current.height = 50
            this.canvases.tooltip.ref.current.width = this.axesGroup.width
            this.canvases.tooltip.ref.current.height = 50
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
            const step = Math.ceil(this.axesGroup.state.data_amount * 0.1)
            context.save()
            context.font = '10px Arial'
            for (let i = step; i <= this.axesGroup.state.data_amount - step * 0.5; i += step) {
                context.beginPath()
                context.moveTo(
                    (i + 0.55) * this.scale, 0
                )
                context.lineTo(
                    (i + 0.55) * this.scale,
                    this.canvases.scale.ref.current.height * 0.1
                )
                context.stroke()
                context.closePath()
                context.fillText(
                    this.dates[i],
                    (i + 0.55) * this.scale - 27,
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
            context.fillRect(
                (i + 0.55) * this.scale - 30, 0,
                60, 25
            )
            context.font = '10px Arial'
            context.fillStyle = '#ffffff'
            context.fillText(
                this.dates[i],
                (i + 0.55) * this.scale - 27,
                this.canvases.tooltip.ref.current.height * 0.3
            )
            context.restore()
        }
    }
    public hide_tooltip(): void {
        this.canvases.tooltip.ref.current?.getContext('2d')?.clearRect(
            0, 0,
            this.canvases.tooltip.ref.current.width,
            this.canvases.tooltip.ref.current.height
        )
    }
    // Event handlers
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const x_offset = (
                this.canvases.tooltip.mouse_events.position.x - (
                    event.clientX - window.left
                )) * this.axesGroup.state.data_amount / 1000000
            if (x_offset) {
                let data_range = {start: 0, end: 1}
                Object.assign(data_range, this.axesGroup.state.data_range)
                if (x_offset < 0) {
                    data_range.start = data_range.start + x_offset <= 0 ?
                        0 : (data_range.end - (data_range.start + x_offset)) * this.axesGroup.total_data_amount > 1000 ?
                            data_range.start : data_range.start + x_offset
                } else if (x_offset > 0) {
                    data_range.start = (data_range.end - (data_range.start + x_offset)) * this.axesGroup.total_data_amount < 5 ?
                        data_range.start : data_range.start + x_offset
                }
                if (data_range.start !== this.axesGroup.state.data_range?.start) {
                    await this.axesGroup.recalculate_metadata(data_range, () => {
                        let state = this.axesGroup.state
                        state.xAxis.canvases.tooltip.mouse_events.position = {
                            x: event.clientX - window.left,
                            y: event.clientY - window.top,
                        }
                        this.axesGroup.setState(state)
                    })
                }
            }
        }
    }
    public mouseOutHandler(): void {
        let state = this.axesGroup.state
        state.xAxis.canvases.tooltip.mouse_events.drag = false
        this.axesGroup.setState(state)
    }
    public mouseDownHandler(event: React.MouseEvent): void {
        let state = this.axesGroup.state
        state.xAxis.canvases.tooltip.mouse_events = {
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
        this.axesGroup.setState(state)
    }
    public mouseUpHandler(): void {
        let state = this.axesGroup.state
        state.xAxis.canvases.tooltip.mouse_events.drag = false
        this.axesGroup.setState(state)
    }
    public render(): React.ReactNode {
        return this.axesGroup.props.xAxis === false ? null :
            <>
                <canvas
                    ref={this.canvases.scale.ref}
                    className={'axes x scale'}
                    style={{
                        width: this.axesGroup.props.size.width,
                        height: 50,
                        gridRowStart: this.axesGroup.state.children.nodes.length + 1,
                        gridRowEnd: this.axesGroup.state.children.nodes.length + 2
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes x tooltip'}
                    style={{
                        width: this.axesGroup.props.size.width,
                        height: 50,
                        gridRowStart: this.axesGroup.state.children.nodes.length + 1,
                        gridRowEnd: this.axesGroup.state.children.nodes.length + 2
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
