import React from 'react'
import {AxesReal} from "../../axes/Axes"
import {PlotData, PlotDataName, Point2D} from "../../utils/types/plotData"
import {DataRange} from "../../utils/types/display"
import {plotDataType} from "../../utils/functions/dataTypes";

export default abstract class Drawing<T extends PlotData> {
    //// Fields
    // Meta data
    protected value: {
        x: { min: number, max: number },
        y: { min: number, max: number }
    }
    public data: { full: T[], observed: T[] }
    public dataType: PlotDataName
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
        this.data = { full: data, observed: [] }
        this.dataType = plotDataType(data) as PlotDataName
        this.style = style ? style : {}
        this.visible = true
        this.settings = false
    }
    // Meta data
    public min(axis: 'x' | 'y'): number { return this.value[axis].min }
    public max(axis: 'x' | 'y'): number { return this.value[axis].max }
    public spread(axis: 'x' | 'y'): number { return this.max(axis) - this.min(axis) }
    public get data_amount(): number { return this.data.observed.length }
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        this.data.observed = this.data.full.slice(
            Math.floor(this.data.full.length * data_range.start),
            Math.ceil(this.data.full.length * data_range.end)
        )
    }
    public point(i: number): Point2D { return this.data.observed[i] as Point2D }
    // Drawing
    public abstract plot(): Promise<void>
    public abstract show_style(): React.ReactNode
    public abstract show_tooltip(x: number): React.ReactNode
    public async draw_tooltip(x: number): Promise<void> {}
}
