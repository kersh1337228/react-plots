import React from 'react'
import {Callback, DataRange, GridPosition, Size2D, TooltipCanvasObject} from "../types"
import Drawing from "../drawings/Drawing"
import {xAxisGroup} from "./axis/xAxisGroup";

interface AxesGroupProps {
    position: GridPosition
    children: React.ReactNode
    size?: Size2D
    xAxis?: boolean
    yAxis?: boolean
    visible?: boolean
    title?: string
}

interface AxesGroupState {
    children: JSX.Element[]
    data_range: DataRange
    data_amount: number
    tooltip: TooltipCanvasObject
    xAxis: xAxisGroup
}

export default class AxesGroup extends React.Component<
    AxesGroupProps, AxesGroupState
> {
    public constructor(props: AxesGroupProps) {
        super(props)
        // Children node size correction
        let children: JSX.Element[]
        if ((props.children as any[]).length) {
            children = props.children as JSX.Element[]
        } else {
            children = [props.children as JSX.Element]
        }
        const [maxRow, maxCol] = [
            Math.max.apply(
                null, Array.from(
                    children, child => child.props.position.row.end
                )
            ), Math.max.apply(
                null, Array.from(
                    children, child => child.props.position.column.end
                )
            )
        ]
        let stateChildren = children.map(child => {
            const xAxis = child === children.at(-1)
            return React.cloneElement(
                child, {
                    ...child.props, size: {
                        width: (child.props.position.column.end -
                            child.props.position.column.start
                        ) * (this.props.size ?
                                this.props.size.width : 0
                        ) / (maxCol - 1) - (
                            child.props.yAxis === false ? 0 : 50
                        ),
                        height: (child.props.position.row.end -
                            child.props.position.row.start
                        ) * (this.props.size ?
                                this.props.size.height : 0
                        ) / (maxRow - 1) - (xAxis ? 50 : 0),
                    }, xAxis
                }
            )
        })
        this.state = {
            children: stateChildren,
            data_range: {
                start: 0,
                end: 1
            },
            data_amount: 0,
            tooltip: {
                ref: React.createRef(),
                mouse_events: {
                    drag: false, position: {x: 0, y: 0}
                }
            },
            xAxis: new xAxisGroup(this)
        }
    }
    //// Meta data
    public get data_amount(): number {
        return this.state.data_amount
    }
    public get max_data_amount(): number {
        return Math.max.apply(
            null, Array.from(
                this.state.children,
                child => Math.max.apply(
                    null, Array.from(
                        child.props.drawings,
                        (drawing: Drawing) => drawing.data.length
                    )
                )
            )
        )
    }
    //// Properties
    public get width(): number {
        return this.props.size? this.props.size.width : 0
    }
    public get height(): number {
        return this.props.size? this.props.size.height : 0
    }
    //// Utilities
    public set_window(callback?: Callback) {
        const state = this.state
        if (state.tooltip.ref.current) {
            state.tooltip.ref.current.width = this.width
            state.tooltip.ref.current.height = this.height
        }
        state.xAxis.set_window()
        this.setState(state, callback)
    }
    public async recalculate_metadata(
        data_range: DataRange,
        callback: Callback = this.plot
    ): Promise<void> {

    }
    public async plot(): Promise<void> {
    //     const context = this.state.canvases.plot.ref.current?.getContext('2d')
    //     context?.clearRect(
    //         0, 0,
    //         this.width, this.height
    //     )
    //     this.state.axes.x.show_grid()
    //     this.state.axes.y.show_grid()
    //     this.props.drawings.forEach(
    //         async drawing => await drawing.plot()
    //     )
    //     await this.state.axes.x.show_scale()
    //     await this.state.axes.y.show_scale()
    }
    // public show_tooltips(y: number, i: number, callback?: Callback): void {
    //     const state = this.state
    //     state.axes.x.show_tooltip(i, y)
    //     state.axes.y.show_tooltip(i, y)
    //     const context = state.canvases.tooltip.ref.current?.getContext('2d')
    //     if (context) {
    //         context.clearRect(
    //             0, 0,
    //             this.width, this.height
    //         )
    //         context.save()
    //         context.beginPath()
    //         context.strokeStyle = '#696969'
    //         context.setLineDash([5, 5])
    //         // Drawing horizontal line
    //         context.moveTo(0, y)
    //         context.lineTo(this.width, y)
    //         const segment_width = this.width / this.data_amount
    //         // Drawing vertical line
    //         context.moveTo(
    //             (2 * i + 1.1) * segment_width / 2, 0
    //         )
    //         context.lineTo(
    //             (2 * i + 1.1) * segment_width / 2, this.height
    //         )
    //         context.stroke()
    //         context.closePath()
    //         context.restore()
    //     }
    //     this.setState({
    //         ...state,
    //         tooltips: this.props.drawings.map(
    //             drawing => drawing.show_tooltip(i)
    //         )
    //     }, callback)
    // }
    // public hide_tooltips(callback?: Callback): void {
    //     const state = this.state
    //     state.canvases.tooltip.mouse_events.drag = false
    //     state.axes.x.hide_tooltips()
    //     state.axes.y.hide_tooltips()
    //     const context = state.canvases.tooltip.ref.current?.getContext('2d')
    //     context?.clearRect(0, 0, this.width, this.height)
    //     this.setState({
    //         ...state,
    //         tooltips: null
    //     }, callback)
    // }
    // //// Mouse events
    // public async mouseMoveHandler(event: React.MouseEvent) {
    //     const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
    //     const [x, y] = [
    //         event.clientX - window.left,
    //         event.clientY - window.top
    //     ]
    //     if (x >= 0 && y >= 0) {
    //         let data_range = {start: 0, end: 1}
    //         Object.assign(data_range, this.state.data_range)
    //         if (this.state.canvases.tooltip.mouse_events.drag) {
    //             const x_offset = (
    //                 x - this.state.canvases.tooltip.mouse_events.position.x
    //             ) * this.data_amount / 100000000
    //             if (x_offset) {
    //                 if (x_offset < 0) {
    //                     data_range.end =
    //                         data_range.end - x_offset >= 1 ?
    //                             1 : data_range.end - x_offset
    //                     data_range.start =
    //                         data_range.end - (
    //                             this.state.data_range.end -
    //                             this.state.data_range.start
    //                         )
    //                 } else if (x_offset > 0) {
    //                     data_range.start =
    //                         data_range.start - x_offset <= 0 ?
    //                             0 : data_range.start - x_offset
    //                     data_range.end =
    //                         data_range.start + (
    //                             this.state.data_range.end -
    //                             this.state.data_range.start
    //                         )
    //                 }
    //             }
    //         }
    //         const i = Math.floor(x / this.width * this.data_amount)
    //         this.show_tooltips(y, i, async () => {
    //             if (
    //                 data_range.start !== this.state.data_range.start &&
    //                 data_range.end !== this.state.data_range.end
    //             ) {
    //                 await this.recalculate_metadata(data_range)
    //             }
    //         })
    //     }
    // }
    // public mouseOutHandler() {
    //     this.setState({tooltips: null}, () => {
    //         const state = this.state
    //         state.canvases.tooltip.mouse_events.drag = false
    //         this.hide_tooltips()
    //     })
    // }
    // public mouseDownHandler(event: React.MouseEvent) {
    //     const state = this.state
    //     state.canvases.tooltip.mouse_events = {
    //         drag: true,
    //         position: {
    //             x: event.clientX - (
    //                 event.target as HTMLCanvasElement
    //             ).getBoundingClientRect().left,
    //             y: event.clientY - (
    //                 event.target as HTMLCanvasElement
    //             ).getBoundingClientRect().top,
    //         }
    //     }
    //     this.setState(state)
    // }
    // public mouseUpHandler() {
    //     const state = this.state
    //     state.canvases.tooltip.mouse_events.drag = false
    //     this.setState(state)
    // }
    //// Life cycle
    // public componentDidMount(): void {
    //     this.set_window(async () => {
    //         const data_amount = Math.max.apply(
    //             null,
    //             [1, ...this.state.drawings.map(
    //                 drawing => drawing.data.length
    //             )]
    //         )
    //         await this.recalculate_metadata({
    //             start: 1 - (
    //                 data_amount <= 100 ?
    //                     data_amount : 100
    //             ) / data_amount,
    //             end: 1
    //         })
    //     })
    // }
    public render(): React.ReactNode {
        return (
            // {this.props.tooltip ?
            //         <canvas
            //             ref={this.state.tooltip.ref}
            //             className={'tooltipShared'}
            //             style={{
            //                 marginLeft: 50,
            //                 width: this.props.width - 50,
            //                 height: this.props.height - 50,
            //                 gridRowStart: 1,
            //                 gridRowEnd: this.state.grid.maxRow,
            //                 gridColumnStart: 1,
            //                 gridColumnEnd: this.state.grid.maxCol
            //             }}
            //             // onMouseMove={this.mouseMoveHandler}
            //             // onMouseOut={this.mouseOutHandler}
            //             // onMouseDown={this.mouseDownHandler}
            //             // onMouseUp={this.mouseUpHandler}
            //         ></canvas> : null
            // }
            <div
                className={'axesGroupGrid'}
                style={{
                    width: (
                        this.props.size ?
                            this.props.size.width : 0
                    ) + 50,
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
                {this.state.children.map(child => {
                    child.props.data_range = this.state.data_range
                    return child
                })}
            </div>
        )
    }
}
