import {Point2D, TimeSeriesArray, Quotes, PlotData, TimeSeriesObject, TimeSeries} from "./types"
import Drawing from "./drawings/Drawing/Drawing";
import {DateTimeRange, Duration} from "./classes";

export function round(x: number, digits: number = 0): number {
    return Math.round((
        x + Number.EPSILON
    ) * 10 ** digits) / 10 ** digits
}

export function numberPower(x: number, digits: number = 0): string {
    const symbols = {1000000: 'M', 1000000000: 'B'}
    for (const [value, symbol] of Object.entries(symbols))
        if (x >= parseInt(value))
            return `${round(x / parseInt(value), digits)}${symbol}`
    return String(round(x, digits))
}

export function plotDataType(data: PlotData[]): 'Point2D' | 'TimeSeriesArray' | 'TimeSeriesObject' | 'Quotes' | 'undefined' {
    try {
        if(typeof (data[0] as Point2D)[0] === 'number') return 'Point2D'
        else if (typeof (data[0] as TimeSeriesArray)[0] === 'string') return 'TimeSeriesArray'
        else return 'undefined'
    } catch {
        if ('date' in data[0] && 'value' in data[0]) return 'TimeSeriesObject'
        else if (
            'date' in data[0] && 'open' in data[0] &&
            'high' in data[0] && 'low' in data[0] &&
            'close' in data[0] && 'volume' in data[0]
        ) return 'Quotes'
        else return 'undefined'
    }
}

export function plotDateRange(drawings: Drawing<TimeSeries | Quotes>[]): DateTimeRange {
    const dates = [...new Set(([] as Array<number>).concat(...drawings.map((drawing) =>
        plotDataType(drawing.data.full) === 'TimeSeriesArray' ?
            Array.from(drawing.data.full as TimeSeriesArray[], arr => new Date(arr[0]).getTime()) :
            Array.from(drawing.data.full as (TimeSeriesObject | Quotes)[], arr => new Date(arr.date).getTime())
    )).sort((a, b) => a > b ? 1 : a < b ? -1 : 0))]
    return new DateTimeRange(
        new Date(dates[0]),
        new Date(dates.at(-1) as number),
        Duration.milliseconds(dates[1] - dates[0])
    )
}
