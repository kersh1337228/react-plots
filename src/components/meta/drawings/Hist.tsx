import Drawing from "./Drawing"
import {PlotData} from "../types"

export interface HistStyle {
    color: {
        pos: string,
        neg: string
    }
}

export default class Hist extends Drawing {
    public constructor(
        name: string,
        data: PlotData,
        style?: HistStyle
    ) {
        super(name, data)
        this.style = style ? style : {
            color: {pos: '#53e9b5', neg: '#da2c4d'}
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
            for (let i = 0; i < this.data_amount; ++i) {
                const value = this.meta_data.observed_data[i]
                context.fillStyle = value > 0 ?
                    this.style.color.pos :
                    this.style.color.neg
                context.fillRect(
                    (i + 0.1) * this.axes.state.axes.x.coordinates.scale,
                    0,
                    this.axes.state.axes.x.coordinates.scale * 0.9,
                    value
                )
            }
            context.restore()
        }
    }
    public show_style(): React.ReactElement {
        return (
            <div key={this.name}>
                <label htmlFor={'visible'}>{this.name}</label>
                <input type={'checkbox'} name={'visible'}
                       onChange={async (event) => {
                           this.visible = event.target.checked
                           await this.axes?.recalculate_metadata(
                               this.axes.state.data_range
                           )
                       }}
                       defaultChecked={this.visible}
                />
                <ul>
                    <li>Positive color: <input
                        type={'color'}
                        defaultValue={this.style.color.pos}
                        onChange={async (event) => {
                            this.style.color.pos = event.target.value
                            await this.axes?.plot()
                        }}
                    /></li>
                    <li>Negative color: <input
                        type={'color'}
                        defaultValue={this.style.color.neg}
                        onChange={async (event) => {
                            this.style.color.neg = event.target.value
                            await this.axes?.plot()
                        }}
                    /></li>
                </ul>
            </div>
        )
    }
}
