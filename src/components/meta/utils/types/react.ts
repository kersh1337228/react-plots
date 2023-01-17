import React from "react"

export interface CanvasObject {  // Drawing canvas
    ref: React.RefObject<HTMLCanvasElement>
    density: number
}

export interface TooltipCanvasObject {  // Event handling canvas
    ref: React.RefObject<HTMLCanvasElement>,
    mouse_events: {
        drag: boolean,
        position: {
            x: number,
            y: number
        }
    }
}

export interface ComponentChildren<T extends React.Component> {  // Container-component children
    components: T[]  // Children components must append themselves directly
    nodes: JSX.Element[]  // Source is props
}