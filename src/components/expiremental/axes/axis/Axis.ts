import {CanvasObject, GridObject, TooltipCanvasObject} from "../../types"
import React from "react"
import Axes from "../Axes"

export default abstract class Axis {
    // Fields
    public coordinates: {
        translate: number,
        scale: number
    }
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
        protected readonly axes: Axes,
        public readonly label?: string,
    ) {
        this.coordinates = {
            translate: 0,
            scale: 1
        }
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
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    public abstract set_window(): void
    public abstract show_grid(): Promise<void>
    public abstract show_scale(): Promise<void>
    public abstract show_tooltip(i: number, value: number): Promise<void>
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
    public abstract render(): React.ReactNode
    // Event handlers
    public abstract mouseMoveHandler(event: React.MouseEvent): void | Promise<void>
    public abstract mouseOutHandler(event: React.MouseEvent): void | Promise<void>
    public abstract mouseDownHandler(event: React.MouseEvent): void | Promise<void>
    public abstract mouseUpHandler(event: React.MouseEvent): void | Promise<void>
}
