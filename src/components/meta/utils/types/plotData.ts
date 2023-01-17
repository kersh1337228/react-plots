// plotData types
import {DateString} from "./dateTime"

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
