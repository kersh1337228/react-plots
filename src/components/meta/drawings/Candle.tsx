import Drawing from "./Drawing/Drawing"
import {HistStyle} from "./Hist"
import {DataRange} from "../utils/types/display"
import {Quotes} from "../utils/types/plotData"
import {round} from "../utils/functions/numeric"

export default class Candle extends Drawing<Quotes> {
    public constructor(name: string, data: Quotes[], style?: HistStyle) {
        super(name, data)
        this.style = style ? style : { color: {pos: '#53e9b5', neg: '#da2c4d'} }
    }
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        const [start, end] = [
            Math.floor(this.data.full.length * data_range.start),
            Math.ceil(this.data.full.length * data_range.end)
        ]
        this.data.observed.full = this.data.full.slice(start, end)
        this.value.y = {
            min: Math.min.apply(null, Array.from(
                this.data.observed.full, obj => obj.low
            ) as number[]),
            max: Math.max.apply(null, Array.from(
                this.data.observed.full, obj => obj.high
            ) as number[])
        }
    }
    public async plot(): Promise<void> {
        if (this.axes) {
            const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
            if (this.visible && context) {
                // Transforming coordinates
                context.save()
                context.translate(
                    this.axes.state.axes.x.coordinates.translate,
                    this.axes.state.axes.y.coordinates.translate
                )
                context.scale(
                    this.axes.state.axes.x.coordinates.scale,
                    -this.axes.state.axes.y.coordinates.scale
                )
                // Drawing
                for (let i = 0; i < this.data_amount; ++i) {
                    const {open, high, low, close} = this.data.observed.full[i]
                    if (open !== null && high !== null  && low !== null && close !== null) {
                        const style = close - open > 0 ?
                            this.style.color.pos : this.style.color.neg
                        // Candle wick
                        context.beginPath()
                        context.moveTo(i + 0.55, low)
                        context.moveTo(i + 0.55, high)
                        context.strokeStyle = style
                        context.stroke()
                        context.closePath()
                        // Candle body
                        if (close - open) {  // Rectangle (non-empty body)
                            context.fillStyle = style
                            context.fillRect(i + 0.1, open, 0.9, close - open)
                        } else {  // Line (empty body)
                            context.moveTo(i + 0.1, open)
                            context.lineTo(i + 1, close)
                        }
                    }
                }
                context.restore()
            }
        }
    }
    public show_tooltip(i: number): React.ReactNode {
        const {open, high, low, close} = this.data.observed.full[i]
        return open !== null && high !== null  && low !== null && close !== null ? (
            <div key={this.name}>
                <span>open: {round(open, 2)}</span>
                <span>high: {round(high, 2)}</span>
                <span>low: {round(low, 2)}</span>
                <span>close: {round(close, 2)}</span>
            </div>
        ) : undefined
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
