import { Callback } from '../../../../utils/types/callable';
import React from 'react';
import { AxisData } from '../../../../utils/types/display';

export interface Metadata {
    global: AxisData
    local: AxisData
    delta: AxisData
}

export function wheelHandler(
    reScale: (ds: number, callback?: Callback) => Promise<void>,
    scale: number
) {
    return async function wheelHandler(event: WheelEvent) {
        event.preventDefault();
        event.stopPropagation();
        reScale(
            -event.deltaY / 2000 * scale,
            // -event.deltaY / 2000 * (local.scale + delta.scale),
            // TODO: this.axes.plot
        )
    }
}

export function mouseMoveHandler(
    reScale: (ds: number, callback?: Callback) => Promise<void>,
    label: string,
) {

}
async function mouseMoveHandler(event: React.MouseEvent) {
    if (this.canvases.tooltip.mouseEvents.drag) {  // If mouse is held => change scale
        const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
        const coordinates = {  // Calculating cursor offset
            x: event.clientX - window.left,
            y: event.clientY - window.top
        }
        this.reScale((
            this.canvases.tooltip.mouseEvents.position[this.label] - coordinates[this.label]
        ) * this.scrollSpeed * this.scale,
            () => {
                const state = this.axes.state  // @ts-ignore
                state.axes[this.label].canvases.tooltip.mouseEvents.position = coordinates  // @ts-ignore
                this.axes.setState(state, this.axes.plot)
            }
        )
    }
}

export function setWindow(
    tooltipCanvas: HTMLCanvasElement
) {
    tooltipCanvas.addEventListener(
        'wheel', wheelHandler(reScale, scale), { passive: false });
}

export function hideTooltip(
    tooltipCanvas: HTMLCanvasElement
) {
    tooltipCanvas.getContext('2d')?.clearRect(
        0, 0, tooltipCanvas.width, tooltipCanvas.height);
}
