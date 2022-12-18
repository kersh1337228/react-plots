import React from 'react'
import {Callback, ComponentChildren, DataRange, GridPosition, Size2D, TooltipCanvasObject} from "../types"
import {xAxisGroup} from "./axis/xAxisGroup"
import {AxesReal} from "../axes/Axes"
import './AxesGroup.css'
import AxesGroupSettings from "./settings/AxesGroupSettings"
import {axisSize} from "../Figure/Figure";

interface AxesGroupPlaceholderProps {
    children: React.ReactNode
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    title?: string
}

// Placeholder
export default function AxesGroup(props: AxesGroupPlaceholderProps): JSX.Element {return <></>}

interface AxesGroupProps extends AxesGroupPlaceholderProps {
    size: Size2D
}

interface AxesGroupState {
    children: ComponentChildren<AxesReal>
    data_range: DataRange
    data_amount: number
    tooltip: TooltipCanvasObject
    xAxis: xAxisGroup
}

export class AxesGroupReal extends React.Component<
    AxesGroupProps, AxesGroupState
> {
    public constructor(props: AxesGroupProps) {
        super(props)
        // Making sure children variable has array type
        let children: JSX.Element[]
        if ((props.children as any[]).length)
            children = props.children as JSX.Element[]
        else
            children = [props.children as JSX.Element]
        const [maxRow, maxCol] = [
            Math.max.apply(null, Array.from(
                children, child => child.props.position.row.end)),
            Math.max.apply(null, Array.from(
                children, child => child.props.position.column.end))
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
            if (child.type.name === 'Axes')
                return React.createElement(AxesReal, {
                    ...child.props, size, xAxis: false, parent: this, key: index,
                    position: {...child.props.position, column: {start: 1, end: 3}}
                })
            else
                throw Error("Only <Axes> can appear as <AxesGroup> children.")
        })
        this.state = {
            children: {
                nodes: stateChildren,
                components: []
            },
            data_range: { start: 0, end: 1 },
            data_amount: 1,
            tooltip: {
                ref: React.createRef(),
                mouse_events: {
                    drag: false, position: {x: 0, y: 0}
                }
            },
            xAxis: new xAxisGroup(this)
        }
        // Methods binding
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    //// Meta data
    public get total_data_amount(): number {
        return Math.max.apply(null, [1, ...Array.from(
            this.state.children.components, child => Math.max.apply(
                null, Array.from(
                    child.state.drawings.filter(drawing => drawing.visible),
                    drawing => drawing.data.full.length
                )
            )
        )])
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
        callback?: Callback
    ): Promise<void> {
        const state = this.state
        state.children.components.forEach(
            async axes => await axes.recalculate_metadata(data_range)
        )
        const data_amount = Math.max.apply(
            null, [1, ...([] as Array<number>).concat(...state.children.components.map(axes => {
                const state = axes.state
                state.drawings.forEach(
                    async drawing => await drawing.recalculate_metadata(data_range)
                )
                return state.drawings.map(drawing => drawing.data_amount)
            }))]
        )
        state.xAxis.scale = this.width / data_amount  // Moving coordinates system
        this.setState(
            {...state, data_range, data_amount},
            () => {
                const state = this.state
                state.xAxis.show_scale()
                this.setState(state, callback)
            }
        )
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
                ) * this.state.data_amount / 1000000
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
            this.recalculate_metadata(data_range, () => {
                let state = this.state
                state.xAxis.show_tooltip(Math.floor(
                    x / this.width * this.state.data_amount
                ))
                state.tooltip.mouse_events.position = {x, y}
                state.children.components.forEach(
                    (axes, i) => axes.show_tooltips(
                        x, y - axes.props.size.height * i
                    )
                )
                this.setState(state)
            })
        }
    }
    public mouseOutHandler() {
        this.recalculate_metadata(this.state.data_range, () => {
            const state = this.state
            state.xAxis.hide_tooltip()
            state.tooltip.mouse_events.drag = false
            state.children.components.forEach(
                axes => axes.hide_tooltips()
            )
            this.setState(state)
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
                    width: this.props.size.width + axisSize.y,
                    height: this.props.size.height + (this.props.xAxis === false ? 0 : axisSize.x),
                    gridRowStart: this.props.position.row.start,
                    gridRowEnd: this.props.position.row.end,
                    gridColumnStart: this.props.position.column.start,
                    gridColumnEnd: this.props.position.column.end
                }}
            >
                {this.state.children.nodes.map((child, index) =>
                    React.createElement(
                        AxesReal, { ...child.props, key: index }
                    )
                )}
                {this.state.xAxis.render()}
                <div
                    className={'axesGroup placeholder'}
                    style={{
                        width: axisSize.y,
                        height: this.props.size?.height,
                        gridRowStart: 1,
                        gridRowEnd: this.state.children.nodes.length + 1
                    }}
                ></div>
                <canvas
                    ref={this.state.tooltip.ref}
                    className={'axesGroup tooltip'}
                    style={{
                        width: this.props.size?.width,
                        height: this.props.size?.height,
                        gridRowStart: 1,
                        gridRowEnd: this.state.children.nodes.length + 1
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
                <AxesGroupSettings axesGroup={this}/>
            </div>
        )
    }
}
