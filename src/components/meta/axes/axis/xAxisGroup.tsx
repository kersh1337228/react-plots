import React from "react"
import {CanvasObject, DateString, GridObject, TooltipCanvasObject} from "../../types"
import {AxesGroupReal} from "../AxesGroup"

export class xAxisGroup {
    // Fields
    public scale: number
    public grid: {
        minor: GridObject,
        major: GridObject
    }
    public readonly canvases: {
        scale: CanvasObject,
        tooltip: TooltipCanvasObject
    }
    // Methods
    public constructor(
        protected readonly axesGroup: AxesGroupReal,
        public dates: DateString[] = [],
        public readonly label?: string
    ) {
        this.scale = 1
        this.grid = {
            minor: {
                amount: 0,
                color: '#d9d9d9',
                width: 1
            },
            major: {
                amount: 10,
                color: '#d9d9d9',
                width: 1
            }
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
        this.show_scale = this.show_scale.bind(this)
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    public hide_tooltips(): void {
        if (this.canvases.tooltip.ref.current) {
            const context = this.canvases.tooltip.ref.current.getContext('2d')
            context?.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
        }
    }
    public set_window(): void {
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
            let step = Math.ceil(this.axesGroup.data_amount * 0.1)
            context.save()
            context.font = '10px Arial'
            for (let i = step; i <= this.axesGroup.data_amount - step * 0.5; i += step) {
                context.beginPath()
                context.moveTo(
                    (2 * i + 1.1) * this.scale / 2, 0
                )
                context.lineTo(
                    (2 * i + 1.1) * this.scale / 2,
                    this.canvases.scale.ref.current.height * 0.1
                )
                context.stroke()
                context.closePath()
                context.fillText(
                    this.dates[i],
                    (2 * i + 1.1) * this.scale / 2 - 27,
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
            const segment_width = this.axesGroup.width / this.dates.length
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
    public hide_tooltip(): void {
        if (this.canvases.tooltip.ref.current) {
            const context = this.canvases.tooltip.ref.current.getContext('2d')
            context?.clearRect(
                0, 0,
                this.canvases.tooltip.ref.current.width,
                this.canvases.tooltip.ref.current.height
            )
        }
    }
    // Event handlers
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const x_offset = (
                this.canvases.tooltip.mouse_events.position.x - (
                    event.clientX - window.left
                )) * this.axesGroup.data_amount / 1000000
            if (x_offset) {
                let data_range = {start: 0, end: 1}
                Object.assign(data_range, this.axesGroup.state.data_range)
                if (x_offset < 0) {
                    data_range.start = data_range.start + x_offset <= 0 ?
                        0 : (data_range.end - (data_range.start + x_offset)) * this.axesGroup.max_data_amount > 1000 ?
                            data_range.start : data_range.start + x_offset
                } else if (x_offset > 0) {
                    data_range.start = (data_range.end - (data_range.start + x_offset)) * this.axesGroup.max_data_amount < 5 ?
                        data_range.start : data_range.start + x_offset
                }
                if (data_range.start !== this.axesGroup.state.data_range?.start) {
                    await this.axesGroup.setState({data_range}, () => {
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
                        gridRowStart: this.axesGroup.state.children.length + 1,
                        gridRowEnd: this.axesGroup.state.children.length + 2
                    }}
                ></canvas>
                <canvas
                    ref={this.canvases.tooltip.ref}
                    className={'axes x tooltip'}
                    style={{
                        width: this.axesGroup.props.size.width,
                        height: 50,
                        gridRowStart: this.axesGroup.state.children.length + 1,
                        gridRowEnd: this.axesGroup.state.children.length + 2
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </>
    }
}
