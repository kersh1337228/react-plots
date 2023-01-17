import React from 'react'
import Drawing from "../drawings/Drawing/Drawing"
import './Axes.css'
import {AxesGroupReal} from "../axesGroup/AxesGroup"
import AxesSettings from "./settings/AxesSettings"
import xAxis from "./axis/xAxis/xAxis"
import xAxisDateTime from "./axis/xAxis/xAxisDateTime"
import yAxis from "./axis/yAxis/yAxis"
import Figure, {axisSize} from "../Figure/Figure"
import {plotDataType} from "../utils/functions/dataTypes"
import xAxisBase from "./axis/xAxis/xAxisBase"
import {PlotData} from "../utils/types/plotData";
import {DataRange, GridPosition, Padding2D, Size2D} from "../utils/types/display"
import {CanvasObject, TooltipCanvasObject} from "../utils/types/react"
import NumberRange from "../utils/classes/iterable/NumberRange"
import DateTimeRange from "../utils/classes/iterable/DateTimeRange"
import {Callback} from "../utils/types/callable"

interface AxesPlaceholderProps {
    drawings: Drawing<PlotData>[]
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    padding?: Padding2D
    title?: string
}

// Placeholder
export default function Axes(props: AxesPlaceholderProps): JSX.Element {return <></>}

// Real - component to be used inside of code
interface AxesProps extends AxesPlaceholderProps {
    size: Size2D
    parent: AxesGroupReal | Figure
    data_range?: DataRange,
    tooltips?: { x: number, y: number }
}

interface AxesState {
    drawings: Drawing<PlotData>[]
    data_range: DataRange
    data_amount: number
    canvases: {
        plot: CanvasObject
        tooltip: TooltipCanvasObject
    }
    axes: { x: xAxisBase<NumberRange | DateTimeRange>, y: yAxis }
    tooltips: React.ReactNode
}

export class AxesReal extends React.Component<AxesProps, AxesState> {
    public constructor(props: AxesProps) {
        super(props)
        // Drawings dType check
        let xAxisInit: xAxisBase<NumberRange | DateTimeRange>
        if (props.drawings.length) {
            if (props.drawings.every(
                drawing => plotDataType(drawing.data.full) === 'Point2D'
            )) xAxisInit = new xAxis(this)  // Numeric data
            else if (props.drawings.every(
                drawing => plotDataType(drawing.data.full) !== 'Point2D'
            )) xAxisInit = new xAxisDateTime(this)  // Time series data
            else throw Error("<Axes> drawings data must have either time series or numeric type")
        } else throw Error("<Axes> must contain at least a single drawing.")
        // State initialization
        this.state = {
            drawings: props.drawings.map(drawing => {
                drawing.axes = this
                return drawing
            }),
            data_range: { start: 0, end: 1 },
            data_amount: 0,
            axes: { x: xAxisInit, y: new yAxis(this) },
            canvases: {
                plot: { ref: React.createRef(), density: 1 },
                tooltip: {
                    ref: React.createRef(),
                    mouse_events: { drag: false, position: { x: 0, y: 0 } }
                }
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
        // Passing children inside of parent node
        let state = props.parent.state
        state.children.components.push(this)
        // @ts-ignore
        props.parent.setState(state)
}
    // All drawings visible
    public get drawings(): Drawing<PlotData>[] {
        return this.state.drawings.filter(drawing => drawing.visible)
    }
    // Max visible drawing data amount
    public get max_data_amount(): number {
        return Math.max.apply(
            null, [1, ...Array.from(
                this.state.drawings.filter(drawing => drawing.visible),
                drawing => drawing.data.full.length
            )]
        )
    }
    // Canvas inner width
    public get width(): number {
        return this.props.size ?
            this.props.size.width *
            this.state.canvases.plot.density : 0
    }
    // Canvas inner height
    public get height(): number {
        return this.props.size ?
            this.props.size.height *
            this.state.canvases.plot.density : 0
    }
    // Image padding
    public get padding(): Padding2D {
        return this.props.padding ? this.props.padding : {
            top: 0, left: 0, bottom: 0, right: 0
        }
    }
    // Canvas inner width with padding
    public get padded_width(): number {
        return  this.width * (
            1 - this.padding.left - this.padding.right
        )
    }
    // Canvas inner height with padding
    public get padded_height(): number {
        return this.height * (
            1 - this.padding.top - this.padding.bottom
        )
    }
    // Change canvas resolution
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
            const context = state.canvases.plot.ref.current.getContext('2d')
            if (context) {
                context.lineJoin = 'round'
                context.lineCap = 'round'
                context.imageSmoothingQuality = 'high'
            }
        }
        state.axes.x.set_window()
        state.axes.y.set_window()
        this.setState(state, callback)
    }
    // Set new meta-data for data range given
    public async recalculate_metadata(data_range: DataRange, callback: Callback = this.plot): Promise<void> {
        const state = this.state
        const drawings = state.drawings.filter(drawing => drawing.visible)
        drawings.forEach(async drawing =>
            await drawing.recalculate_metadata(data_range)
        )
        this.setState({
            data_range, data_amount: Math.max.apply(
                null, [1, ...drawings.map(drawing => drawing.data_amount)]
            )
        }, () => {
            const state = this.state
            state.axes.x.transform_coordinates(drawings)
            state.axes.y.transform_coordinates(drawings)
            callback()
        })
    }
    // Draw plots
    public async plot(): Promise<void> {
        this.state.canvases.plot.ref.current?.getContext('2d')?.clearRect(
            0, 0, this.width, this.height
        )
        console.log(this.state.axes.y.coordinates.scale)
        if (this.drawings.length) {
            this.state.axes.x.show_grid()
            this.state.axes.y.show_grid()
            this.drawings.forEach(async drawing => await drawing.plot())
            await this.state.axes.x.show_scale()
            await this.state.axes.y.show_scale()
        }
    }
    // Draw crosshair and tooltips
    public show_tooltips(x: number, y: number, callback?: Callback): void {
        const state = this.state
        const context = state.canvases.tooltip.ref.current?.getContext('2d')
        context?.clearRect(0, 0, this.width, this.height)
        if (this.drawings.length) {
            if (context) {
                context.save()
                context.lineWidth = this.state.canvases.plot.density
                context.strokeStyle = '#696969'
                context.setLineDash([5, 5])
                state.axes.x.show_tooltip(x)
                state.axes.y.show_tooltip(y)
                context.restore()
            }
            const i = Math.floor(x / this.props.size.width * this.state.data_amount)
            this.setState({
                ...state, tooltips: this.state.drawings.filter(
                    drawing => drawing.visible
                ).map(drawing => drawing.show_tooltip(i))
            }, callback)
        }
    }
    // Clear crosshair and tooltips
    public hide_tooltips(callback?: Callback): void {
        const state = this.state
        state.canvases.tooltip.mouse_events.drag = false
        state.axes.x.hide_tooltip()
        state.axes.y.hide_tooltip()
        const context = state.canvases.tooltip.ref.current?.getContext('2d')
        context?.clearRect(0, 0, this.width, this.height)
        this.setState({...state, tooltips: null}, callback)
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
                ) * 0.001 / this.state.axes.x.coordinates.scale * this.state.axes.x.scroll_speed
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
    public static getDerivedStateFromProps(nextProps: Readonly<AxesProps>, prevState: Readonly<AxesState>) {
        return nextProps.data_range ?
            {...prevState, data_range: nextProps.data_range} :
            prevState
    }
    public componentDidUpdate(prevProps: Readonly<AxesProps>, prevState: Readonly<AxesState>, snapshot?: any) {
        // Data range
        if (prevProps.data_range?.start !== this.props.data_range?.start ||
            prevProps.data_range?.end !== this.props.data_range?.end
        ) this.recalculate_metadata(this.state.data_range)
        // Tooltips
        if (prevProps.tooltips !== this.props.tooltips)
            if (this.props.tooltips)
                this.show_tooltips(this.props.tooltips.x, this.props.tooltips.y)
            else if (!this.props.tooltips && prevProps.tooltips)
                this.hide_tooltips()
    }
    public componentDidMount(): void {
        this.set_window(async () =>
            await this.recalculate_metadata(
                this.props.data_range ?
                    this.props.data_range : {
                    start: 1 - (
                        this.max_data_amount <= 100 ?
                            this.max_data_amount : 100
                    ) / this.max_data_amount, end: 1
                })
        )
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGrid'}
                style={{
                    width: (
                        this.props.size ?
                            this.props.size.width : 0
                    ) + (this.props.yAxis === false ? 0 : axisSize.y),
                    height: (
                        this.props.size ?
                            this.props.size.height : 0
                    ) + (this.props.xAxis === false ? 0 : axisSize.x),
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
                {this.props.parent instanceof AxesGroupReal ?
                    null : <AxesSettings axes={this}/>}
            </div>
        )
    }
}
