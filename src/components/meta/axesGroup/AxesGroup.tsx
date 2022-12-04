import React from 'react'
import {Callback, DataRange, GridPosition, Size2D, TooltipCanvasObject} from "../types"
import {xAxisGroup} from "./axis/xAxisGroup"
import {AxesReal} from "../axes/Axes"
import './AxesGroup.css'
import AxesGroupSettings from "./settings/AxesGroupSettings"

interface AxesGroupPlaceholderProps {
    position: GridPosition
    children: React.ReactNode
    xAxis?: boolean
    yAxis?: boolean
    visible?: boolean
    title?: string
}

export default function AxesGroup(props: AxesGroupPlaceholderProps): JSX.Element {return <></>}

interface AxesGroupProps extends AxesGroupPlaceholderProps {
    size: Size2D
}

interface AxesGroupState {
    children: React.ComponentElement<any, AxesReal>[]
    axes: AxesReal[]
    data_range: DataRange | null
    data_amount: number
    tooltip: TooltipCanvasObject
    tooltips: {
        x: number, y: number
    } | null
    xAxis: xAxisGroup
}

export class AxesGroupReal extends React.Component<
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
        let stateChildren = children.map((child, index) => {
            const size = {
                width: (child.props.position.column.end -
                    child.props.position.column.start
                ) * (this.props.size ?
                        this.props.size.width : 0
                ) / (maxCol - 1),
                height: (child.props.position.row.end -
                    child.props.position.row.start
                ) * (this.props.size ?
                        this.props.size.height : 0
                ) / (maxRow - 1),
            }
            if (child.type.name === 'Axes') {
                return React.createElement(AxesReal, {
                    ...child.props, size, xAxis: false, group: this, key: index,
                    position: {...child.props.position, column: {start: 1, end: 3}}
                })
            } else {
                throw Error(
                    "Only <Axes> can appear as <AxesGroup> child."
                )
            }
        })
        this.state = {
            children: stateChildren,
            axes: [],
            data_range: null,
            data_amount: 0,
            tooltip: {
                ref: React.createRef(),
                mouse_events: {
                    drag: false, position: {x: 0, y: 0}
                }
            },
            tooltips: null,
            xAxis: new xAxisGroup(this)
        }
        // Methods binding
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    //// Meta data
    public get data_amount(): number {
        return this.state.data_amount
    }
    public get max_data_amount(): number {
        return Math.max.apply(
            null, Array.from(
                this.state.axes,
                child => Math.max.apply(
                    null, Array.from(
                        child.state.drawings.filter(drawing => drawing.visible),
                        drawing => drawing.data.length
                    )
                )
            )
        )
    }
    //// Properties
    public get width(): number {
        return this.props.size.width
    }
    public get height(): number {
        return this.props.size.height
    }
    //// Utilities
    public async recalculate_metadata(
        data_range: DataRange,
        data_amount: number
    ): Promise<void> {
        const state = this.state
        // Moving coordinates system
        state.xAxis.scale = this.width / data_amount

        state.xAxis.dates = new Array(data_amount).fill('2002-10-10')

        this.setState({...state, data_range, data_amount}, this.state.xAxis.show_scale)
    }
    public set_window(callback?: Callback) {
        const state = this.state
        if (state.tooltip.ref.current) {
            state.tooltip.ref.current.width = this.width
            state.tooltip.ref.current.height = this.height
        }
        state.xAxis.set_window()
        this.setState(state, callback)
    }
    // Event handlers
    public async mouseMoveHandler(event: React.MouseEvent) {
        const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
        const [x, y] = [
            event.clientX - window.left,
            event.clientY - window.top
        ]
        if (x >= 0 && y >= 0 && this.state.data_range) {
            let data_range = {start: 0, end: 1}
            Object.assign(data_range, this.state.data_range)
            if (this.state.tooltip.mouse_events.drag) {
                const x_offset = (
                    x - this.state.tooltip.mouse_events.position.x
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
            this.setState({tooltips: {x, y}, data_range}, () => {
                let state = this.state
                state.xAxis.show_tooltip(
                    Math.floor(x / this.width * this.data_amount)
                )
                state.tooltip.mouse_events.position = {x, y}
                this.setState(state)
            })
        }
    }
    public mouseOutHandler() {
        const state = this.state
        state.tooltip.mouse_events.drag = false
        this.setState({...state, tooltips: null}, () => {
            this.state.xAxis.hide_tooltips()
        })
    }
    public mouseDownHandler(event: React.MouseEvent) {
        const state = this.state
        state.tooltip.mouse_events = {
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
        state.tooltip.mouse_events.drag = false
        this.setState(state)
    }
    // Life cycle
    public componentDidMount(): void {
        this.set_window()
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGroupGrid'}
                style={{
                    width: this.props.size.width + 50,
                    height: this.props.size.height + (this.props.xAxis === false ? 0 : 50),
                    gridRowStart: this.props.position.row.start,
                    gridRowEnd: this.props.position.row.end,
                    gridColumnStart: this.props.position.column.start,
                    gridColumnEnd: this.props.position.column.end
                }}
            >
                {this.state.children.map((child, index) => {
                    return React.createElement(
                        AxesReal,
                        {
                            ...child.props,
                            data_range: this.state.data_range,
                            tooltips: this.state.tooltips ? {
                                ...this.state.tooltips,
                                y: this.state.tooltips?.y - child.props.size.height * index
                            } : undefined,
                            key: index
                        }
                    )
                })}
                {this.state.xAxis.render()}
                <div
                    className={'axesGroup placeholder'}
                    style={{
                        width: 50,
                        height: this.props.size?.height,
                        gridRowStart: 1,
                        gridRowEnd: this.state.children.length + 1
                    }}
                ></div>
                <AxesGroupSettings axesGroup={this}/>
                <canvas
                    ref={this.state.tooltip.ref}
                    className={'axesGroup tooltip'}
                    style={{
                        width: this.props.size?.width,
                        height: this.props.size?.height,
                        gridRowStart: 1,
                        gridRowEnd: this.state.children.length + 1
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
            </div>
        )
    }
}
