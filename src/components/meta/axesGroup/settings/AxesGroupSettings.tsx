import React from 'react'
import Dialog from "../../../utils/dialog/Dialog"
import SettingsIcon from "../../icons/SettingsIcon"
import {AxesGroupReal} from "../AxesGroup"
import AxesGroupObjectTree from "./objectTree/AxesGroupObjectTree.jsx"
import '../../axes/settings/AxesSettings.css'
import './AxesGroupSettings.css'

interface AxesGroupSettingsProps {
    axesGroup: AxesGroupReal
}

interface AxesGroupSettingsState {
    active: boolean
}

export default class AxesGroupSettings extends React.Component<
    AxesGroupSettingsProps, AxesGroupSettingsState
> {
    public constructor(props: AxesGroupSettingsProps) {
        super(props)
        this.state = {
            active: false
        }
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGroupSettings'}
                style={{
                    gridRowStart: this.props.axesGroup.state.children.nodes.length + 1,
                    gridRowEnd: this.props.axesGroup.state.children.nodes.length + 2
                }}
                onClick={() => {this.setState({active: !this.state.active})}}
            >
                <SettingsIcon/>
                <Dialog
                    title={
                        this.props.axesGroup.props.title ?
                            `${this.props.axesGroup.props.title} Axes Group Settings` :
                            `Nameless Axes Group Settings`
                    } tabs={{
                    'Object tree': <AxesGroupObjectTree axesGroup={this.props.axesGroup} />,
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
