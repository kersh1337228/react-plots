import Drawing from "./Drawing"
import {PlotData} from "../types"
import React from "react"
import './Drawing.css'

export interface CurveStyle {
    color: string,
    width: number
}

export default class Curve extends Drawing {
    public constructor(
        name: string,
        data: PlotData,
        style?: CurveStyle
    ) {
        super(name, data)
        this.style = style ? style : {
            color: '#000000', width: 1
        }
    }
    public async plot(): Promise<void> {
        const context = this.axes?.state.canvases.plot.ref.current?.getContext('2d')
        if (this.visible && context && this.axes) {
            // Transforming coordinates
            context.save()
            context.translate(
                this.axes.state.axes.x.coordinates.translate,
                this.axes.state.axes.y.coordinates.translate
            )
            context.scale(
                1, -this.axes.state.axes.y.coordinates.scale
            )
            // Drawing
            context.beginPath()
            context.moveTo(
                1.1 * this.axes.state.axes.x.coordinates.scale / 2,
                this.meta_data.observed_data[0]
            )
            for (let i = 1; i < this.data_amount; ++i) {
                context.lineTo(
                    (2 * i + 1.1) * this.axes.state.axes.x.coordinates.scale / 2,
                    this.meta_data.observed_data[i]
                )
            }
            // Stroking
            context.restore()
            context.save()
            context.lineWidth = this.style.width
            context.strokeStyle = this.style.color
            context.stroke()
            context.closePath()
            context.restore()
        }
    }
    public show_style(): React.ReactElement {
        return (
            <div key={this.name}>
                <label htmlFor={'visible'}>{this.name}</label>
                <input
                    type={'checkbox'}
                    name={'visible'}
                    onChange={async (event) => {
                        this.visible = event.target.checked
                        await this.axes?.recalculate_metadata(
                            this.axes.state.data_range
                        )
                    }}
                    defaultChecked={this.visible}
                />
                <ul>
                    <li>
                        Line color: <input
                        defaultValue={this.style.color}
                        onChange={async (event) => {
                            this.style.color = event.target.value
                            await this.axes?.plot()
                        }} type={'color'}/>
                    </li>
                    <li>
                        Line width: <input
                        type={'number'}
                        min={1} max={3} step={1}
                        defaultValue={this.style.width}
                        onChange={async (event) => {
                            this.style.width = event.target.valueAsNumber
                            await this.axes?.plot()
                        }}
                    />
                    </li>
                </ul>
            </div>
        )
    }
    public show_tooltip(i: number): JSX.Element {
        const context = this.axes?.state.canvases.tooltip.ref.current?.getContext('2d')
        if (context && this.axes) {
            context.save()
            context.beginPath()
            context.arc(
                (2 * i + 1.1) * this.axes.state.axes.x.coordinates.scale / 2,
                this.axes.state.axes.y.coordinates.translate -
                this.meta_data.observed_data[i] *
                this.axes.state.axes.y.coordinates.scale,
                3,
                0,
                2 * Math.PI
            )
            context.fillStyle = this.style.color
            context.fill()
            context.closePath()
            context.restore()
        }
        return (
            <div key={this.name} className={'drawing curve tooltips'}>
                {this.name}: {Math.round((
                    this.meta_data.observed_data[i] + Number.EPSILON
                ) * 100) / 100}
            </div>
        )
    }
}
