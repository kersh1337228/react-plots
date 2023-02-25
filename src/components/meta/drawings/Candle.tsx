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
        super.recalculate_metadata(data_range)
        this.value.y = {
            min: Math.min.apply(null, Array.from(
                this.data.observed, obj => obj.low
            ).filter(low => low !== null) as number[]),
            max: Math.max.apply(null, Array.from(
                this.data.observed, obj => obj.high
            ).filter(high => high !== null) as number[])
        }
    }
    public async plot(): Promise<void> {
        const start = performance.now()

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
                    this.axes.state.axes.y.coordinates.scale
                )
                // Drawing
                for (let i = 0; i < this.data_amount; ++i) {
                    const data = this.data.observed[i]
                    if (data.open !== null && data.high !== null && data.low !== null && data.close !== null) {
                        const {open, high, low, close} = data
                        const style = close - open > 0 ?
                            this.style.color.pos : this.style.color.neg
                        // Candle wick
                        context.beginPath()
                        context.moveTo(i + 0.55, low)
                        context.lineTo(i + 0.55, high)
                        context.closePath()
                        context.save()
                        context.resetTransform()
                        context.lineWidth = 1
                        context.strokeStyle = style
                        context.stroke()
                        context.restore()
                        // Candle body
                        if (close - open) {  // Rectangle (non-empty body)
                            context.fillStyle = style
                            context.fillRect(i + 0.1, open, 0.9, close - open)
                        } else {  // Line (empty body)
                            context.beginPath()
                            context.moveTo(i + 0.1, open)
                            context.lineTo(i + 1, close)
                            context.closePath()
                            context.save()
                            context.resetTransform()
                            context.strokeStyle = style
                            context.stroke()
                            context.restore()
                        }

                    }
                }
                context.restore()
            }
        }

        // console.log(`Drawing: ${(performance.now() - start) / 1000.}`)
    }
    public show_tooltip(x: number): React.ReactNode {
        if (this.axes) {
            const i = Math.floor(x / this.axes.props.size.width * this.axes.state.data_amount)
            const data = this.data.observed[i]
            return data.open !== null && data.high !== null  && data.low !== null && data.close !== null ? (
                <div key={this.name}>
                    <span>open: {round(data.open, 2)}</span>
                    <span>high: {round(data.high, 2)}</span>
                    <span>low: {round(data.low, 2)}</span>
                    <span>close: {round(data.close, 2)}</span>
                </div>
            ) : undefined
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
