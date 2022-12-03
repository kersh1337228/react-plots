import React from 'react'
import './Figure.css'
import {AxesReal} from "./axes/Axes"
import {AxesGroupReal} from "./axes/AxesGroup"

enum FigureChildren {
    Axes = 'Axes',
    AxesGroup = 'AxesGroup'
}

interface FigureProps {
    width: number
    height: number
    children: React.ReactNode
    name?: string
}

interface FigureState {
    children: React.ReactNode
}

export default class Figure extends React.Component<
    FigureProps, FigureState
> {
    public constructor(props: FigureProps) {
        super(props)
        // Children node size correction
        if (props.children) {
            let children: JSX.Element[]
            if ((props.children as any[]).length) {
                children = props.children as JSX.Element[]
            } else {
                children = [props.children as JSX.Element]
            }
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
                children: children.map((child, index) => {
                    const size = {
                        width: (
                            child.props.position.column.end -
                            child.props.position.column.start
                        ) * this.props.width / (maxCol - 1) - (
                            child.props.yAxis === false ? 0 : 50
                        ),
                        height: (
                            child.props.position.row.end -
                            child.props.position.row.start
                        ) * this.props.height / (maxRow - 1) - (
                            child.props.xAxis === false ? 0 : 50
                        ),
                    }
                    if (child.type.name === FigureChildren.Axes) {
                        return React.createElement(AxesReal, {...child.props, size, key: index})
                    } else if (child.type.name === FigureChildren.AxesGroup) {
                        return React.createElement(AxesGroupReal, {...child.props, size, key: index})
                    } else {
                        throw Error(
                            "Only <Axes> and <AxesGroup> can appear as <Figure> child."
                        )
                    }
                })
            }
        }
    }
    public render(): React.ReactElement {
        return (
            <div
                className={'figureGrid'}
                style={{
                    width: this.props.width,
                    height: this.props.height
                }}
            >
                {this.state.children}
            </div>
        )
    }
}
