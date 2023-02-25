export type Point2D = [number, number | null]
export type TimeSeriesArray = [string, number | null]
export type TimeSeriesObject = {timestamp: string, value: number | null, [key: string]: any}
export type Quotes = {
    timestamp: string,
    open: number | null,
    high: number | null,
    low: number | null,
    close: number | null,
    volume: number | null
}
export type TimeSeries = TimeSeriesArray | TimeSeriesObject | Quotes
export type PlotData = Point2D | TimeSeries
export type PlotDataName = 'Point2D' | 'TimeSeriesArray' | 'TimeSeriesObject' | 'Quotes'
