import React from 'react'
import {DataRange, PlotData} from "../types"
import {AxesReal} from "../axes/Axes"

export default abstract class Drawing {
    // Fields
    protected meta_data: {
        value: {
            min: number,
            max: number
        },
        observed_data: any[]
    }
    protected style: {
        [key: string]: any
    }
    public visible: boolean
    public axes?: AxesReal
    // Methods
    public constructor(
        public readonly name: string,
        public readonly data: PlotData
    ) {
        this.meta_data = {
            value: {
                min: 0,
                max: 0
            },
            observed_data: []
        }
        this.style = {}
        this.visible = true
    }
    //// Meta data
    public get min(): number {
        return this.meta_data.value.min
    }
    public get max(): number {
        return this.meta_data.value.max
    }
    public get spread(): number {
        return this.max - this.min
    }
    public get data_amount(): number {
        return this.meta_data.observed_data.length
    }
    //// Procedures
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        const [start, end] = [
            Math.floor(this.data.length * data_range.start),
            Math.ceil(this.data.length * data_range.end)
        ]
        this.meta_data.observed_data = this.data.slice(start, end)
        this.meta_data.value = {
            min: Math.min.apply(null, this.meta_data.observed_data),
            max: Math.max.apply(null, this.meta_data.observed_data)
        }
    }
    public abstract plot(): Promise<void>
    public abstract show_style(): React.ReactNode
    public show_tooltip(i: number): React.ReactNode {
        return (
            <span key={this.name}>
                {this.name}: {Math.round((
                    this.meta_data.observed_data[i] + Number.EPSILON
                ) * 100) / 100}
            </span>
        )
    }
}
