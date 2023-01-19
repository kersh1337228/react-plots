export type Point2D = [number, number | null]
export type TimeSeriesArray = [string, number | null]
export type TimeSeriesObject = {date: string, value: number | null, [key: string]: any}
export type Quotes = {
    date: string,
    open: number | null,
    high: number | null,
    low: number | null,
    close: number | null,
    volume: number | null
}
export type TimeSeries = TimeSeriesArray | TimeSeriesObject | Quotes
export type PlotData = Point2D | TimeSeries
