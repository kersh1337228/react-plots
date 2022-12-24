import React from "react"

// General purpose types
export type Callback = () => void | Promise<void>
export type Constructor<T extends {}> = new (...args: any[]) => T

export interface DataRange {  // Time series view interval
    start: number
    end: number
}

export interface Size2D {
    width: number
    height: number
}

export interface Padding2D {
    left: number
    top: number
    right: number
    bottom: number
}

export interface GridPosition {  // CSS grid display position
    row: {
        start: number,
        end: number
    }
    column: {
        start: number,
        end: number
    }
}

export interface GridObject {  // Plot axes grid
    amount: number
    color: string
    width: number
}

// HTML elements
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

//// Plotting types
// Date string representation
export type DecimalPoint = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type YearString = `${19 | 20}${DecimalPoint}${DecimalPoint}`
type MonthString = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`
type DayString = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `${1 | 2}${DecimalPoint}` | `3${0 | 1}`
export type DateString = `${YearString}-${MonthString}-${DayString}` | `${YearString}-${MonthString}` | YearString
// Time string representation
type HourString = `${0 | 1}${DecimalPoint}` | `2${0 | 1 | 2 | 3}`
type MinuteString = `${0 | 1 | 2 | 3 | 4 | 5}${DecimalPoint}`
export type TimeString = `${HourString}:${MinuteString}:${MinuteString}` | `${HourString}:${MinuteString}`

// Axes data types
export type Point2D = [number, number]
export type TimeSeriesArray = [DateString, number]
export type TimeSeriesObject = {date: DateString, value: number, [key: string]: any}
export type TimeSeries = TimeSeriesArray | TimeSeriesObject
export type Quotes = {
    date: DateString,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number
}

export type PlotData = Point2D | TimeSeries | Quotes
