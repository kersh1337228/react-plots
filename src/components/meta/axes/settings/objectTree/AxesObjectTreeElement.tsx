import React from 'react'
import EyeIcon from "../../../icons/EyeIcon"
import CrossIcon from "../../../icons/CrossIcon"
import SettingsIcon from "../../../icons/SettingsIcon"
import Dialog from "../../../../utils/dialog/Dialog"
import Drawing from "../../../drawings/Drawing"

interface AxesObjectTreeElementProps {
    drawing: Drawing
}

interface AxesObjectTreeElementState {
    active: boolean
}

export default class AxesObjectTreeElement extends React.Component<
    AxesObjectTreeElementProps, AxesObjectTreeElementState
> {
    public constructor(props: AxesObjectTreeElementProps) {
        super(props)
        this.state = {
            active: false
        }
    }
    public render(): React.ReactNode {
        return (
            <li className={'objectTreeElement'}>
                <span>{this.props.drawing.constructor.name}</span>
                <span>{this.props.drawing.name}</span>
                <span onClick={() => {this.setState({active: true})}}>
                    <SettingsIcon/>
                </span>
                <span onClick={async () => {
                    this.props.drawing.visible = !this.props.drawing.visible
                    await this.props.drawing.axes?.recalculate_metadata(
                        this.props.drawing.axes.state.data_range
                    )
                }}><EyeIcon/></span>
                <span onClick={() => {
                    this.props.drawing.axes?.setState({
                        drawings: this.props.drawing.axes.state.drawings.filter(
                            d => d.name !== this.props.drawing.name
                        )
                    }, async () => {
                        await this.props.drawing.axes?.recalculate_metadata(
                            this.props.drawing.axes.state.data_range
                        )
                    })
                }}><CrossIcon/></span>
                <Dialog
                    title={`${this.props.drawing.name} settings`}
                    tabs={{
                        Style: this.props.drawing.show_style()
                    }}
                    active={this.state.active}
                    close={() => {this.setState({active: false})}}
                />
            </li>
        )
    }
}
