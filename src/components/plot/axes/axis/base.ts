import {
    AxisData,
    AxisGrid,
    Font
} from '../../../../utils_refactor/types/display';
import { useRef, useState } from 'react';

export declare type AxisProps = {
    visible: boolean;
    name: string;
}

export declare type AxisState = {
    grid: AxisGrid;
    font: Font;
    visible: boolean;
    global: AxisData;
    local: AxisData;
    delta: AxisData;
    drag: boolean;
    mousePos: {
        x: number;
        y: number;
    };
    ctx: {
        scale: CanvasRenderingContext2D | null;
        tooltip: CanvasRenderingContext2D | null;
    };
}

export declare type AxisContext = {

}

export default function useAxis(
    label: 'x' | 'y',
    scrollSpeed: number = 1,
    deltaMin: number = 5,
    deltaMax: number = 500,
    name?: string,
    visible: boolean = true,
    grid: AxisGrid = {
        amount: 5,
        color: '#d9d9d9',
        width: 1
    },
    font: Font = {
        family: 'Serif',
        size: 10
    }
) {
    const [state, setState] = useState<AxisState>({
        grid,
        font,
        visible,
        global: {
            min: 0,
            max: 0,
            scale: 1,
            translate: 0
        },
        local: {
            min: 0,
            max: 0,
            scale: 1,
            translate: 0
        },
        delta: {
            min: deltaMin,
            max: deltaMax,
            scale: 0,
            translate: 0
        },
        drag: false,
        mousePos: {
            x: 0,
            y: 0
        },
        ctx: {
            scale: null,
            tooltip: null
        }
    });

    const scaleRef = useRef<HTMLCanvasElement>(null),
        tooltipRef = useRef<HTMLCanvasElement>(null);

    function hideTooltip() {
        state.ctx.tooltip?.clearRect(
            0, 0,
            (tooltipRef.current as HTMLCanvasElement).width,
            (tooltipRef.current as HTMLCanvasElement).height
        );
    }

    function wheelHandler(reScale: (ds: number) => void) {
        return (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();
            reScale(-event.deltaY / 2000 * (
                state.local.scale + state.delta.scale));
        };
    }

    function mouseMoveHandler(reScale: (ds: number) => void) {
        return (event: React.MouseEvent) => {
            if (state.drag) {
                const window = (event.target as HTMLCanvasElement)
                    .getBoundingClientRect();
                const coordinates = {
                    x: event.clientX - window.left,
                    y: event.clientY - window.top
                };
                // this.reScale(( // TODO: callback
                //     state.mousePos[label] - coordinates[label]
                // ) * this.scrollSpeed * this.scale,
                //     () => {
                //         this.setState({
                //             ...this,
                //             mousePosition: coordinates
                //         });
                //     }
                // );
            }
        }
    }

    function mouseOutHandler(_: React.MouseEvent) {
        setState({
            ...state,
            drag: false
        });
    }

    function mouseDownHandler(event: React.MouseEvent) {
        setState({
            ...state,
            mousePos: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            }
        });
    }

    function mouseUpHandler(_: React.MouseEvent) {
        setState({
            ...state,
            drag: false
        });
    }

    return {
        state,
        setState,
        label,
        scrollSpeed,
        name,
        scaleRef,
        tooltipRef,
        hideTooltip,
        wheelHandler,
        mouseMoveHandler,
        mouseOutHandler,
        mouseDownHandler,
        mouseUpHandler
    };
}