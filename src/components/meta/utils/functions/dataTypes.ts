import {PlotData, Point2D, TimeSeriesArray} from "../types/plotData"

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
