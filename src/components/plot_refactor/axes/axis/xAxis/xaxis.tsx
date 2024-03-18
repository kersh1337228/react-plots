import React, { useRef, useState } from 'react';
import { Callback } from '../../../../../utils/types/callable';
import { AxisData } from '../../../../../utils/types/display';
import { CanvasObject, TooltipCanvasObject } from '../../../../../utils/types/reactObjects';

interface xaxis {
    metadata: {
        global: AxisData
        local: AxisData
        delta: AxisData
    }
    grid: {
        amount: number
        color: string
        width: number
    }
    font: { name: string, size: number }
    readonly canvases: {
        scale: CanvasObject
        tooltip: TooltipCanvasObject
    }
    scrollSpeed: number
    // readonly axes: T
    readonly label: 'x' | 'y'
    readonly name: string
    // data: { global: T, local: T }
    init(): void
    get min(): number
    get max(): number
    get spread(): number
    get scale(): number
    get translate(): number
    reScale(ds: number, callback?: Callback): Promise<void>
    reTranslate(dt: number, callback?: Callback): Promise<void>
    coordinatesTransform(): void
    setWindow(): void
    showScale(): Promise<void>
    showTooltip(coordinate: number): Promise<void>
    hideTooltip(): void
    wheelHandler(event: React.WheelEvent): Promise<void>
    mouseMoveHandler(event: React.MouseEvent): Promise<void>
    mouseOutHandler(): Promise<void>
    mouseDownHandler(event: React.MouseEvent): Promise<void>
    mouseUpHandler(): Promise<void>
}

export default function XAxis() {
    const [global, setGlobal] = useState(
        { min: 0, max: 0, scale: 1, translate: 0 });
    const [local, setLocal] = useState(
        { min: 0, max: 0, scale: 1, translate: 0 });
    const [delta, setDelta] = useState(
        { min: 5, max: 500, scale: 0, translate: 0 });
    const grid = { amount: 5, color: '#d9d9d9', width: 1 };
    const font = { name: 'SF UI Display', size: 10 };

    const scaleRef = useRef<HTMLCanvasElement>();
    const [scaleDensity, setScaleDensity] = useState(1);
    const tooltipRef = useRef<HTMLCanvasElement>();
    const [drag, setDrag] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const scrollSpeed = 1;
    const label = 'x';
    const name = '';


}
