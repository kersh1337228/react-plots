import React from 'react'
import Drawing from "../drawings/Drawing/Drawing"
import './Axes.css'
import {AxesGroupReal} from "../axesGroup/AxesGroup"
import AxesSettings from "./settings/AxesSettings"
import xAxis from "./axis/xAxis/xAxis"
import xAxisDateTime from "./axis/xAxis/xAxisDateTime"
import yAxis from "./axis/yAxis/yAxis"
import Figure, {axisSize, initDataAmount} from "../Figure/Figure"
import {fillData, plotDataTypeVectorised} from "../utils/functions/dataTypes"
import xAxisBase from "./axis/xAxis/xAxisBase"
import {PlotData, Point2D, TimeSeries} from "../utils/types/plotData";
import {DataRange, GridPosition, Padding2D, Size2D} from "../utils/types/display"
import {CanvasObject, TooltipCanvasObject} from "../utils/types/react"
import NumberRange, {plotNumberRange} from "../utils/classes/iterable/NumberRange"
import DateTimeRange, {plotDateTimeRange} from "../utils/classes/iterable/DateTimeRange"
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
        let labels: number[] | string[]
        if (props.drawings.length) {
            const dType = plotDataTypeVectorised(props.drawings)
            if (dType)
                if (dType === 'Point2D') {
                    xAxisInit = new xAxis(this)
                    labels = [...plotNumberRange(props.drawings as Drawing<Point2D>[])]
                } else {
                    xAxisInit = new xAxisDateTime(this)
                    labels = [...plotDateTimeRange(props.drawings as Drawing<TimeSeries>[]).format('%Y-%m-%d')]
                }
            else throw Error("<Axes> drawings must have uniform data type")
        } else throw Error("<Axes> must contain at least one drawing.")
        // State initialization
        this.state = {
            drawings: props.drawings.map(drawing => {
                if (!drawing.data.full.length) throw Error('Drawing data can not be empty.')
                drawing.axes = this
                drawing.data.full = fillData(drawing.data.full, labels)
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
    public get padding(): { top: number, left: number, bottom: number, right: number } {
        return this.props.padding ? {
            top: this.props.padding.top ?  this.props.padding.top : 0,
            left: this.props.padding.left ?  this.props.padding.left : 0,
            bottom: this.props.padding.bottom ?  this.props.padding.bottom : 0,
            right: this.props.padding.right ?  this.props.padding.right : 0
        } : { top: 0, left: 0, bottom: 0, right: 0 }
    }
    // Canvas borders coordinates
    public get left(): number {
        return this.width * this.padding.left
    }
    public get right(): number {
        return this.width * (1 - this.padding.right)
    }
    public get top(): number {
        return this.height * (1 - this.padding.top)
    }
    public get bottom(): number {
        return this.height * this.padding.bottom
    }
    // Canvas inner width with padding
    public get padded_width(): number {
        return this.right - this.left
    }
    // Canvas inner height with padding
    public get padded_height(): number {
        return this.top - this.bottom
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
        }
        state.axes.x.set_window()
        state.axes.y.set_window()
        this.setState(state, callback)
    }
    // Set new meta-data for data range given
    public async recalculate_metadata(data_range: DataRange, callback: Callback = this.plot): Promise<void> {
        this.drawings.forEach(drawing => drawing.recalculate_metadata(data_range))
        this.setState({
            data_range, data_amount: Math.max.apply(
                null, [1, ...this.drawings.map(drawing => drawing.data_amount)]
            )
        }, () => {
            if (this.drawings.length) {
                const state = this.state
                state.axes.x.transform_coordinates(this.drawings)
                state.axes.y.transform_coordinates(this.drawings)
                this.setState(state, callback)
            } else callback()
        })
    }
    // Draw plots
    public async plot(): Promise<void> {
        const start = performance.now()

        this.state.canvases.plot.ref.current?.getContext('2d')?.clearRect(
            0, 0, this.width, this.height
        )
        if (this.drawings.length) {
            await this.state.axes.x.show_scale()
            await this.state.axes.y.show_scale()
            this.drawings.forEach(async drawing => await drawing.plot())
        }

        // console.log(`plot ${(performance.now() - start) / 1000}, ${this.max_data_amount}`)
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
            this.setState({
                ...state, tooltips: this.state.drawings.filter(
                    drawing => drawing.visible
                ).map(drawing => drawing.show_tooltip(x))
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
                ) * this.state.axes.x.scroll_speed / this.state.axes.x.coordinates.scale / this.max_data_amount * 2
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
                    start: 1 - Math.min(
                        initDataAmount, this.max_data_amount
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
