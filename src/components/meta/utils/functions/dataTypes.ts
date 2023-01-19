import {PlotData, Point2D, Quotes, TimeSeries, TimeSeriesArray, TimeSeriesObject} from "../types/plotData"
import Drawing from "../../drawings/Drawing/Drawing"

export function plotDataType(data: PlotData[]): 'Point2D' | 'TimeSeriesArray' | 'TimeSeriesObject' | 'Quotes' | undefined | never {
    try {
        if(typeof (data[0] as Point2D)[0] === 'number') return 'Point2D'
        else if (typeof (data[0] as TimeSeriesArray)[0] === 'string') return 'TimeSeriesArray'
        else return undefined
    } catch {
        if (!data.length) throw Error('Data is empty.')
        if ('date' in data[0] && 'value' in data[0]) return 'TimeSeriesObject'
        else if (
            'date' in data[0] && 'open' in data[0] &&
            'high' in data[0] && 'low' in data[0] &&
            'close' in data[0] && 'volume' in data[0]
        ) return 'Quotes'
        else return undefined
    }
}

export function plotDataTypeVectorised(drawings: Drawing<PlotData>[]): 'Point2D' | 'TimeSeries' | undefined {
    const dTypes = drawings.map(drawing => plotDataType(drawing.data.full))
    return dTypes.every(dType => dType === 'Point2D') ?
        'Point2D' : dTypes.every(dType => dType !== 'Point2D') ?
            'TimeSeries' : undefined
}

export function fillData(data: PlotData[], labels: number[] | string[]): PlotData[] | never {
    let copy: PlotData[] = []
    switch (plotDataType(data)) {
        case 'Point2D': {
            const labelsPresent = Array.from(data as Point2D[], pair => pair[0])
            let i = -1
            labels.forEach(label => {
                if (!labelsPresent.includes(label as number))
                    copy.push([label as number, null])
                else copy.push(data[++i])
            })
            break
        } case 'TimeSeriesArray': {
            const labelsPresent = Array.from(data as TimeSeriesArray[], pair => pair[0])
            let i = -1
            labels.forEach(label => {
                if (!labelsPresent.includes(label as string))
                    copy.push([label as string, null])
                else copy.push(data[++i])
            })
            break
        } case 'TimeSeriesObject': {
            const labelsPresent = Array.from(data as TimeSeriesObject[], obj => obj.date)
            const fields = Object.keys(copy[0]).filter(field => !['date', 'value'].includes(field))
            let i = -1
            labels.forEach(label => {
                if (!labelsPresent.includes(label as string)) {
                    const obj: TimeSeriesObject = { date: label as string, value: null }
                    fields.forEach(field => obj[field] = null)
                    copy.push(obj)
                } else copy.push(data[++i])
            })
            break
        }
        case 'Quotes': {
            const labelsPresent = Array.from(data as Quotes[], obj => obj.date)
            let i = -1
            labels.forEach(label => {
                if (!labelsPresent.includes(label as string)) {
                    const obj: Quotes = {
                        date: label as string, open: null,
                        high: null, low: null, close: null, volume: null
                    }
                    copy.push(obj)
                } else copy.push(data[++i])
            })
            break
        }
        default: throw Error('Data type is undefined.')
    }
    return copy
}
