import Drawing from "./Drawing/Drawing"
import {DataRange, Quotes} from "../types"
import {HistStyle} from "./Hist"

export default class Candle extends Drawing<Quotes> {
    public constructor(
        name: string,
        data: Quotes[],
        style?: HistStyle
    ) {
        super(name, data)
        this.style = style ? style : {
            color: {pos: '#53e9b5', neg: '#da2c4d'}
        }
    }
    public async recalculate_metadata(data_range: DataRange): Promise<void> {
        if (data_range) {
            const [start, end] = [
                Math.floor(this.data.full.length * data_range.start),
                Math.ceil(this.data.full.length * data_range.end)
            ]
            this.data.observed.full = this.data.full.slice(start, end)
            this.value.y = {
                min: Math.min.apply(null, Array.from(
                    this.data.observed.full, obj => obj.low
                )),
                max: Math.max.apply(null, Array.from(
                    this.data.observed.full, obj => obj.high
                ))
            }
        }
    }
    public async plot(): Promise<void> {
        const context = this.axes?.state.canvases.plot.ref.current?.getContext('2d')
        if (this.visible && context && this.axes) {
            context.save()
            for (let i = 0; i < this.data_amount; ++i) {
                const {open, high, low, close} = this.data.observed.full[i]
                const style = close - open > 0 ?
                    this.style.color.pos :
                    this.style.color.neg
                // Shadow
                context.beginPath()
                context.moveTo(
                    (2 * i + 1.1) * this.axes.state.axes.x.coordinates.scale / 2,
                    low
                )
                context.lineTo(
                    (2 * i + 1.1) * this.axes.state.axes.x.coordinates.scale / 2,
                    high
                )
                context.strokeStyle = style
                context.stroke()
                context.closePath()
                // Body
                if (close - open) {  // Rectangle (non-empty body)
                    context.fillStyle = style
                    context.fillRect(
                        (i + 0.1) * this.axes.state.axes.x.coordinates.scale,
                        open,
                        this.axes.state.axes.x.coordinates.scale * 0.9,
                        close - open
                    )
                } else {  // Line (empty body)
                    context.moveTo(
                        (i + 0.1) * this.axes.state.axes.x.coordinates.scale,
                        open
                    )
                    context.lineTo(
                        (i + 1) * this.axes.state.axes.x.coordinates.scale,
                        close
                    )
                }
            }
            context.restore()
        }
    }
    public show_tooltip(i: number): React.ReactElement {
        const {open, high, low, close} = this.data.observed.full[i]
        return (
            <div key={this.name}>
                <span>open: {Math.round((open + Number.EPSILON) * 100) / 100}</span>
                <span>high: {Math.round((high + Number.EPSILON) * 100) / 100}</span>
                <span>low: {Math.round((low + Number.EPSILON) * 100) / 100}</span>
                <span>close: {Math.round((close + Number.EPSILON) * 100) / 100}</span>
            </div>
        )
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
