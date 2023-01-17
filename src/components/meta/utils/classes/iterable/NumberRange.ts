import TypedRange from "./TypedRange"
import Drawing from "../../../drawings/Drawing/Drawing"
import {Point2D} from "../../types/plotData"

export default class NumberRange extends TypedRange<number> {
    constructor(private readonly arrays: number[][]) {
        super([...new Set(([] as Array<number>).concat(...arrays).sort(
            (a, b) => a < b ? -1 : a > b ? 1 : 0
        ))])
    }
    public format(format_string: string): string[] {
        const matches = [...format_string.matchAll(/%\.(\d*)f/g)]
        return this.container.map(num => {
            let fstr = format_string
            matches.forEach(match => {
                fstr = fstr.replace(match[0], String(Math.round((
                    num + Number.EPSILON
                ) * 10 ** parseInt(match[1])) / 10 ** parseInt(match[1])))
            })
            return fstr
        })
    }
    public at(i: number, j: number = -1): number | undefined {
        return j < 0 ? this.container.at(i) : this.arrays.at(j)?.at(i)
    }
    public slice(begin: number, end: number): NumberRange {
        return new NumberRange(
            this.arrays.map(arr => arr.slice(begin, end))
        )
    }
    public nearest(x: number, tolerance: number = 1.): number | undefined {
        const nearest_value = this.container.sort(
            (a, b) => Math.abs(a - x) < Math.abs(b - x) ? -1 : 1
        ).at(0) as number
        return Math.abs(nearest_value - x) < tolerance ? nearest_value : undefined
    }
    public indexOf(value: number, tolerance: number = 1.): number[] | undefined {
        const nearest_value = this.nearest(value, tolerance)
        return nearest_value ? this.arrays.map(
            (value, index) => [value.indexOf(nearest_value), index]
        ).filter(pair => pair[0] > -1)[0] : undefined
    }
}

export function plotNumberRange(drawings: Drawing<Point2D>[]): NumberRange {
    return new NumberRange(drawings.map(
        drawing => drawing.data.full.map(point => point[0])
    ))
}
