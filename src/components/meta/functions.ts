import {Point2D, TimeSeriesArray, Quotes, PlotData, TimeSeriesObject, DateString, TimeSeries} from "./types"
import Drawing from "./drawings/Drawing/Drawing";

export function round(x: number, digits: number = 0) {
    return Math.round((
        x + Number.EPSILON
    ) * 10 ** digits) / 10 ** digits
}

export function plotDataType(data: PlotData[]):
    'Point2D' | 'TimeSeriesArray' | 'TimeSeriesObject' | 'Quotes' | 'undefined'
{
    try {
        if(typeof (data[0] as Point2D)[0] === 'number') {
            return 'Point2D'
        } else if (typeof (data[0] as TimeSeriesArray)[0] === 'string') {
            return 'TimeSeriesArray'
        } else {
            return 'undefined'
        }
    } catch {
        if ('date' in data[0] && 'value' in data[0]) {
            return 'TimeSeriesObject'
        } else if (
            'date' in data[0] && 'open' in data[0] &&
            'high' in data[0] && 'low' in data[0] &&
            'close' in data[0] && 'volume' in data[0]
        ) {
            return 'Quotes'
        } else {
            return 'undefined'
        }
    }
}

export function* plotDateRange(drawings: Drawing<TimeSeries | Quotes>[]): Generator<DateString> {
    const dates = ([] as Array<number>).concat(...drawings.map((drawing) =>
        plotDataType(drawing.data.full) === 'TimeSeriesArray' ?
            Array.from(drawing.data.full as TimeSeriesArray[], arr => new Date(arr[0]).getTime()) :
            Array.from(drawing.data.full as (TimeSeriesObject | Quotes)[], arr => new Date(arr.date).getTime())
    ))
    const [minDate, maxDate] = [
        new Date(Math.min.apply(null, dates)),
        new Date(Math.max.apply(null, dates))
    ]
    for(let i = minDate; i <= maxDate; i.setDate(i.getDate() + 1))
        yield i.toLocaleDateString('sv') as DateString
}
