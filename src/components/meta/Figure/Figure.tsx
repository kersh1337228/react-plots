import React from 'react'
import {AxesReal} from "../axes/Axes"
import {AxesGroupReal} from "../axesGroup/AxesGroup"
import {ComponentChildren} from "../utils/types/react"
import './Figure.css'

export const axisSize = { x: 50, y: 50 }

interface FigureProps {
    width: number
    height: number
    children: React.ReactNode
    name?: string
}

interface FigureState {
    children: ComponentChildren<AxesReal | AxesGroupReal>
}

export default class Figure extends React.Component<
    FigureProps, FigureState
> {
    public constructor(props: FigureProps) {
        super(props)
        // Children nodes size correction
        if (props.children) {
            // Making sure children variable has array type
            let children: JSX.Element[]
            if ((props.children as any[]).length)
                children = props.children as JSX.Element[]
            else
                children = [props.children as JSX.Element]
            // Finding max row and column listed in children props
            const [maxRow, maxCol] = [
                Math.max.apply(
                    null, Array.from(
                        children, child => child.props.position.row.end
                    )
                ), Math.max.apply(
                    null, Array.from(
                        children, child => child.props.position.column.end
                    )
                )
            ]
            this.state = {
                children: {
                    nodes: children.map((child, index) => {
                        const size = {  // Calculating nested axes or axes group size
                            width: (
                                child.props.position.column.end -
                                child.props.position.column.start
                            ) * this.props.width / (maxCol - 1) - (
                                child.props.yAxis === false ? 0 : axisSize.y
                            ),
                            height: (
                                child.props.position.row.end -
                                child.props.position.row.start
                            ) * this.props.height / (maxRow - 1) - (
                                child.props.xAxis === false ? 0 : axisSize.x
                            ),
                        }
                        if (child.type.name === 'Axes') // <Axes>
                            return React.createElement(AxesReal, {...child.props, parent: this, size, key: index})
                        else if (child.type.name === 'AxesGroup') // <AxesGroup>
                            return React.createElement(AxesGroupReal, {...child.props, parent: this, size, key: index})
                        else  // any other tag
                            throw Error("Only <Axes> and <AxesGroup> can appear as <Figure> children.")
                    }),
                    components: []
                }
            }
        }
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'figureGrid'}
                style={{
                    width: this.props.width,
                    height: this.props.height
                }}
            >{this.state.children.nodes}</div>
        )
    }
}
