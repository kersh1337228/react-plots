import React from "react"

export type Callback = () => void | Promise<void>

export interface DataRange {
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

export interface GridPosition {
    row: {
        start: number,
        end: number
    }
    column: {
        start: number,
        end: number
    }
}

export interface GridObject {
    amount: number
    color: string
    width: number
}

export interface CanvasObject {
    ref: React.RefObject<HTMLCanvasElement>
    density: number
}

export interface TooltipCanvasObject {
    ref: React.RefObject<HTMLCanvasElement>,
    mouse_events: {
        drag: boolean,
        position: {
            x: number,
            y: number
        }
    }
}

// Date string representation
export type DecimalPoint = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type YearString = `19${DecimalPoint}${DecimalPoint}` | `20${DecimalPoint}${DecimalPoint}`
type MonthString = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`
type DayString = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `${1 | 2}${DecimalPoint}` | `3${0 | 1}`
export type DateString = `${YearString}-${MonthString}-${DayString}`

// Axes data types
type DataPoints = [number, number][]
type DataDateValue = [DateString, number][]
type Quotes = {
    date: DateString,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number
}
type DataFinancial = Quotes[]

export type PlotData = DataPoints | DataDateValue | DataFinancial | number[]
