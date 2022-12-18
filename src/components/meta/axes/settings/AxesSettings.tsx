import React from 'react'
import {AxesReal} from "../Axes"
import Dialog from "../../../utils/dialog/Dialog"
import './AxesSettings.css'
import AxesObjectTree from "./objectTree/AxesObjectTree"
import SettingsIcon from "../../icons/SettingsIcon"

interface AxesSettingsProps {
    axes: AxesReal
}

interface AxesSettingsState {
    active: boolean
}

export default class AxesSettings extends React.Component<
    AxesSettingsProps, AxesSettingsState
> {
    public constructor(props: AxesSettingsProps) {
        super(props)
        this.state = {
            active: false
        }
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesSettings'}
                onClick={() => {this.setState({active: !this.state.active})}}
            >
                <SettingsIcon/>
                <Dialog
                    title={
                        this.props.axes.props.title ?
                            `${this.props.axes.props.title} Axes Settings` : `Nameless Axes Settings`
                    } tabs={{
                        'Object tree': <AxesObjectTree axes={this.props.axes} />,
                        Style: (
                            <div>Style tab</div>
                        )
                    }}
                    active={this.state.active}
                    close={() => {this.setState({active: false})}}
                    size={{width: 400}}
                />
            </div>
        )
    }
}
