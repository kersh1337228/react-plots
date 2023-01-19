import React from "react"
import {AxesReal} from "../Axes"
import Drawing from "../../drawings/Drawing/Drawing"
import {AxesGroupReal} from "../../axesGroup/AxesGroup"
import {GridObject} from "../../utils/types/display"
import {CanvasObject, TooltipCanvasObject} from "../../utils/types/react"


export default abstract class Axis<T extends AxesReal | AxesGroupReal> {
    // Fields
    public coordinates: { translate: number, scale: number }
    public grid: GridObject
    public font: { name: string, size: number }
    public readonly canvases: { scale: CanvasObject, tooltip: TooltipCanvasObject }
    protected value: { min: number, max: number }
    public scroll_speed: number
    // Methods
    public constructor(
        protected readonly axes: T,
        public readonly label?: string
    ) {
        this.coordinates = { translate: 0, scale: 1 }
        this.grid = { amount: 5, color: '#d9d9d9', width: 1 }
        this.font = { name: 'Arial', size: 10 }
        this.canvases = {
            scale: { ref: React.createRef(), density: 1 },
            tooltip: {
                ref: React.createRef(),
                mouse_events: { drag: false, position: { x: 0, y: 0 } }
            }
        }
        this.value = { min: 0, max: 0 }
        this.scroll_speed = 1
        // Events binding
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    // Meta data
    public get min() { return this.value.min }
    public get max() { return this.value.max }
    public get spread() { return this.max - this.min }
    public abstract transform_coordinates(drawings: Drawing<any>[]): void
    // Display
    public abstract set_window(): void
    public abstract show_scale(): Promise<void>
    public abstract show_tooltip(coordinate: number): Promise<void>
    public hide_tooltip(): void {
        this.canvases.tooltip.ref.current?.getContext('2d')?.clearRect(
            0, 0,
            this.canvases.tooltip.ref.current.width,
            this.canvases.tooltip.ref.current.height
        )
    }
    public abstract render(): React.ReactNode
    // Event handlers
    public abstract mouseMoveHandler(event: React.MouseEvent): void | Promise<void>
    public abstract mouseOutHandler(event: React.MouseEvent): void | Promise<void>
    public abstract mouseDownHandler(event: React.MouseEvent): void | Promise<void>
    public abstract mouseUpHandler(event: React.MouseEvent): void | Promise<void>
}
