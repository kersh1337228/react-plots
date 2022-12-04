import React from 'react'
import Drawing from "../drawings/Drawing"
import {Callback, CanvasObject, DataRange, GridPosition, Padding2D, Size2D, TooltipCanvasObject} from "../types"
import {xAxis} from "./axis/xAxis"
import {yAxis} from "./axis/yAxis"
import './Axes.css'
import {AxesGroupReal} from "../axesGroup/AxesGroup"
import AxesSettings from "./settings/AxesSettings"

interface AxesPlaceholderProps {
    drawings: Drawing[]
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    visible?: boolean
    padding?: Padding2D
    title?: string
}

export default function Axes(props: AxesPlaceholderProps): JSX.Element {return <></>}

interface AxesProps extends AxesPlaceholderProps {
    data_range: DataRange | null
    size: Size2D
    group?: AxesGroupReal
    tooltips?: {x: number, y: number}
}

interface AxesState {
    drawings: Drawing[]
    data_range: DataRange
    canvases: {
        plot: CanvasObject
        tooltip: TooltipCanvasObject
    }
    axes: {
        x: xAxis,
        y: yAxis
    }
    meta_data: {
        value: {
            min: number,
            max: number
        },
        data_amount: number
    }
    tooltips: React.ReactNode
}

export class AxesReal extends React.Component<
    AxesProps, AxesState
> {
    public constructor(props: AxesProps) {
        super(props)
        this.state = {
            drawings: props.drawings.map(drawing => {
                drawing.axes = this
                return drawing
            }),
            data_range: {
                start: 0, end: 1
            },
            axes: {
                x: new xAxis(this),
                y: new yAxis(this)
            },
            canvases: {
                plot: {
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
            },
            meta_data: {
                value: {
                    min: 0,
                    max: 0
                },
                data_amount: 0
            },
            tooltips: null,
        }
        // Methods binding
        this.recalculate_metadata = this.recalculate_metadata.bind(this)
        this.plot = this.plot.bind(this)
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
        if (props.group) {
            let state = props.group.state
            state.axes.push(this)
            props.group.setState(state)
        }
    }
    //// Meta data
    public get min(): number {
        return this.state.meta_data.value.min ?
            this.state.meta_data.value.min : 0
    }
    public get max(): number {
        return this.state.meta_data.value.max ?
            this.state.meta_data.value.max : 0
    }
    public get spread(): number {
        return this.max - this.min
    }
    public get data_amount(): number {
        return this.state.meta_data.data_amount ?
            this.state.meta_data.data_amount : 0
    }
    public get max_data_amount(): number {
        const max =  Math.max.apply(
            null, Array.from(
                this.state.drawings.filter(drawing => drawing.visible),
                drawing => drawing.data.length
            )
        )
        return max ? max : 0
    }
    //// Properties
    public get width(): number {
        return this.props.size?
            this.props.size.width *
            this.state.canvases.plot.density : 0
    }
    public get padded_width(): number {
        return this.props.padding ?
            this.width * (
                1 - this.props.padding.left - this.props.padding.right
            ) : this.width
    }
    public get height(): number {
        return this.props.size?
            this.props.size.height *
            this.state.canvases.plot.density : 0
    }
    public get padded_height(): number {
        return this.props.padding ?
            this.height * (
                1 - this.props.padding.top - this.props.padding.bottom
            ) : this.height
    }
    //// Utilities
    public set_window(callback?: Callback) {
        const state = this.state
        if (
            state.canvases.plot.ref.current &&
            state.canvases.tooltip.ref.current
        ) {
            state.canvases.plot.ref.current.width = this.width
            state.canvases.plot.ref.current.height = this.height
            state.canvases.tooltip.ref.current.width = this.width
            state.canvases.tooltip.ref.current.height = this.height
        }
        state.axes.x.set_window()
        state.axes.y.set_window()
        this.setState(state, callback)
    }
    public async recalculate_metadata(
        data_range: DataRange,
        callback: Callback = this.plot
    ): Promise<void> {
        const state = this.state
        const drawings = state.drawings.filter(drawing => drawing.visible)
        if (drawings.length) {
            drawings.forEach(
                async drawing =>
                    await drawing.recalculate_metadata(data_range)
            )
            state.meta_data.value.min = Math.min.apply(
                null, drawings.map(drawing => drawing.min)
            )
            state.meta_data.value.max = Math.max.apply(
                null, drawings.map(drawing => drawing.max)
            )
            state.meta_data.data_amount = Math.max.apply(
                null, drawings.map(drawing => drawing.data_amount)
            )
            // Rescaling
            state.axes.y.coordinates.scale = this.padded_height / this.spread
            state.axes.x.coordinates.scale = this.padded_width / this.data_amount
            // Moving coordinates system
            state.axes.y.coordinates.translate =
                this.max * state.axes.y.coordinates.scale + (
                    this.props.padding ?
                        this.props.padding.top: 0
                ) * this.height
            state.axes.x.coordinates.translate = (
                this.props.padding ?
                    this.props.padding.left : 0
            ) * this.width

            state.axes.x.dates = new Array(this.data_amount).fill('2002-10-10')
        }
        this.setState({...state, data_range}, () => {
            if (this.props.group)
                this.props.group.recalculate_metadata(data_range, this.data_amount)
            callback()
        })
    }
    public async plot(): Promise<void> {
        const context = this.state.canvases.plot.ref.current?.getContext('2d')
        context?.clearRect(
            0, 0,
            this.width, this.height
        )
        this.state.axes.x.show_grid()
        this.state.axes.y.show_grid()
        this.state.drawings.filter(
            drawing => drawing.visible
        ).forEach(
            async drawing => await drawing.plot()
        )
        await this.state.axes.x.show_scale()
        await this.state.axes.y.show_scale()
    }
    public show_tooltips(x: number, y: number, callback?: Callback): void {
        const i = Math.floor(x / this.width * this.data_amount)
        const state = this.state
        state.axes.x.show_tooltip(i)
        state.axes.y.show_tooltip(y)
        const context = state.canvases.tooltip.ref.current?.getContext('2d')
        if (context) {
            context.clearRect(
                0, 0,
                this.width, this.height
            )
            context.save()
            context.beginPath()
            context.strokeStyle = '#696969'
            context.setLineDash([5, 5])
            // Drawing horizontal line
            context.moveTo(0, y)
            context.lineTo(this.width, y)
            const segment_width = this.width / this.data_amount
            // Drawing vertical line
            context.moveTo(
                (2 * i + 1.1) * segment_width / 2, 0
            )
            context.lineTo(
                (2 * i + 1.1) * segment_width / 2, this.height
            )
            context.stroke()
            context.closePath()
            context.restore()
        }
        this.setState({
            ...state,
            tooltips: this.state.drawings.filter(
                drawing => drawing.visible
            ).map(
                drawing => drawing.show_tooltip(i)
            )
        }, callback)
    }
    public hide_tooltips(callback?: Callback): void {
        const state = this.state
        state.canvases.tooltip.mouse_events.drag = false
        state.axes.x.hide_tooltip()
        state.axes.y.hide_tooltip()
        const context = state.canvases.tooltip.ref.current?.getContext('2d')
        context?.clearRect(0, 0, this.width, this.height)
        this.setState({
            ...state,
            tooltips: null
        }, callback)
    }
    // Event handlers
    public async mouseMoveHandler(event: React.MouseEvent) {
        const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
        const [x, y] = [
            event.clientX - window.left,
            event.clientY - window.top
        ]
        if (x >= 0 && y >= 0) {
            let data_range = {start: 0, end: 1}
            Object.assign(data_range, this.state.data_range)
            if (this.state.canvases.tooltip.mouse_events.drag) {
                const x_offset = (
                    x - this.state.canvases.tooltip.mouse_events.position.x
                ) * this.data_amount / 1000000
                if (x_offset) {
                    if (x_offset < 0) {
                        data_range.end =
                            data_range.end - x_offset >= 1 ?
                                1 : data_range.end - x_offset
                        data_range.start =
                            data_range.end - (
                                this.state.data_range.end -
                                this.state.data_range.start
                            )
                    } else if (x_offset > 0) {
                        data_range.start =
                            data_range.start - x_offset <= 0 ?
                                0 : data_range.start - x_offset
                        data_range.end =
                            data_range.start + (
                                this.state.data_range.end -
                                this.state.data_range.start
                            )
                    }
                }
            }
            this.show_tooltips(x, y, async () => {
                if (
                    data_range.start !== this.state.data_range.start &&
                    data_range.end !== this.state.data_range.end
                ) {
                    await this.recalculate_metadata(data_range, () => {
                        let state = this.state
                        state.canvases.tooltip.mouse_events.position = {x, y}
                        this.setState(state, this.plot)
                    })
                }
            })
        }
    }
    public mouseOutHandler() {
        const state = this.state
        state.canvases.tooltip.mouse_events.drag = false
        this.setState({...state, tooltips: null}, () => {
            this.hide_tooltips()
        })
    }
    public mouseDownHandler(event: React.MouseEvent) {
        const state = this.state
        state.canvases.tooltip.mouse_events = {
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
        this.setState(state)
    }
    public mouseUpHandler() {
        const state = this.state
        state.canvases.tooltip.mouse_events.drag = false
        this.setState(state)
    }
    // Life cycle
    public static getDerivedStateFromProps(
        nextProps: Readonly<AxesProps>,
        prevState: Readonly<AxesState>
    ) {
        if (nextProps.data_range)
            return {...prevState, data_range: nextProps.data_range}
        return prevState
    }
    public componentDidUpdate(
        prevProps: Readonly<AxesProps>,
        prevState: Readonly<AxesState>,
        snapshot?: any
    ) {
        if (
            prevProps.data_range?.start !== this.props.data_range?.start ||
            prevProps.data_range?.end !== this.props.data_range?.end
        )
            this.recalculate_metadata(this.state.data_range)
        if (prevProps.tooltips !== this.props.tooltips)
            if (this.props.tooltips) {
                this.show_tooltips(this.props.tooltips.x, this.props.tooltips.y)
            } else if (!this.props.tooltips && prevProps.tooltips) {
                this.hide_tooltips()
            }
    }
    public componentDidMount(): void {
        this.set_window(async () => {
            const data_amount = Math.max.apply(
                null,
                [1, ...this.state.drawings.map(
                    drawing => drawing.data.length
                )]
            )
            await this.recalculate_metadata(
                this.props.data_range ?
                    this.props.data_range : {
                    start: 1 - (
                        data_amount <= 100 ?
                            data_amount : 100
                    ) / data_amount,
                    end: 1
                }
            )
        })
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGrid'}
                style={{
                    width: (
                        this.props.size ?
                            this.props.size.width : 0
                    ) + (this.props.yAxis === false ? 0 : 50),
                    height: (
                        this.props.size ?
                            this.props.size.height : 0
                    ) + (this.props.xAxis === false ? 0 : 50),
                    gridRowStart: this.props.position.row.start,
                    gridRowEnd: this.props.position.row.end,
                    gridColumnStart: this.props.position.column.start,
                    gridColumnEnd: this.props.position.column.end
                }}
            >
                <div className={'axes tooltips'}>
                    {this.state.tooltips}
                </div>
                <canvas
                    ref={this.state.canvases.plot.ref}
                    className={'axes plot scale'}
                    style={{
                        width: this.props.size?.width,
                        height: this.props.size?.height
                    }}
                ></canvas>
                <canvas
                    ref={this.state.canvases.tooltip.ref}
                    className={'axes plot tooltip'}
                    style={{
                        width: this.props.size?.width,
                        height: this.props.size?.height
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
                {this.state.axes.x.render()}
                {this.state.axes.y.render()}
                {this.props.group ? null : <AxesSettings axes={this}/>}
            </div>
        )
    }
}
