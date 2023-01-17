import React from 'react'
import {AxesReal} from "../../axes/Axes"
import {PlotData} from "../../utils/types/plotData"
import {DataRange} from "../../utils/types/display"

export default abstract class Drawing<T extends PlotData> {
    //// Fields
    // Meta data
    protected value: {
        x: { min: number, max: number },
        y: { min: number, max: number }
    }
    public data: { full: T[], observed: {
        full: T[], numeric: number[]
    } }
    // Display
    protected style: { [key: string]: any }
    protected settings: boolean
    public visible: boolean
    public axes?: AxesReal
    //// Methods
    protected constructor(
        public readonly name: string,
        data: T[],
        style?: { [key: string]: any }
    ) {
        this.value = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 }
        }
        this.data = { full: data, observed: { full: [], numeric: [] } }
        this.style = style ? style : {}
        this.visible = true
        this.settings = false
    }
    // Meta data
    public min(axis: 'x' | 'y'): number { return this.value[axis].min }
    public max(axis: 'x' | 'y'): number { return this.value[axis].max }
    public spread(axis: 'x' | 'y'): number { return this.max(axis) - this.min(axis) }
    public get data_amount(): number { return this.data.observed.numeric.length }
    public abstract recalculate_metadata(data_range: DataRange): Promise<void>
    public point(i: number): [number, number] { return [i, this.data.observed.numeric[i]] }
    // Drawing
    public abstract plot(): Promise<void>
    public abstract show_style(): React.ReactNode
    public abstract show_tooltip(i: number): React.ReactNode
    public draw_tooltip(i: number): void {}
}
