'use client';

import React from 'react';
import Modal from '../modal/Modal';
import {
    Point,
    Size
} from '../../../utils/types/display';
import CrossIcon from '../icons/CrossIcon';
import './Dialog.css';

interface DialogProps {
    title: string,
    tabs: {
        [key: string]: React.ReactNode
    }
    active: boolean
    close: () => void
    zIndex: number
    size?: Partial<Size>
    offset?: { x?: number | string, y?: number | string }
}

interface DialogState {
    activeTab: string
    drag: {
        state: boolean
        position: Point
        translate: Point
    }
}

export default class Dialog extends React.Component<
    DialogProps, DialogState
> {
    public constructor(props: DialogProps) {
        super(props)
        this.state = {
            activeTab: Object.keys(props.tabs)[0],
            drag: {
                state: false,
                position: {x: 0, y: 0},
                translate: {x: 0, y: 0}
            }
        }
        this.changePosition = this.changePosition.bind(this)
    }
    public get offset(): { x: number | string, y: number | string } {
        return {
            x: typeof this.props.offset?.x === 'number' ?
                `${this.props.offset.x}px` : this.props.offset?.x ? this.props.offset.x : '0px',
            y: typeof this.props.offset?.y === 'number' ?
                `${this.props.offset.y}px` : this.props.offset?.y ? this.props.offset.y : '0px'
        }
    }
    public changePosition(event: React.MouseEvent): void {
        if (this.state.drag.state) {
            this.setState({drag: {
                ...this.state.drag, translate: {
                    x: event.clientX - this.state.drag.position.x,
                    y: event.clientY - this.state.drag.position.y
                }
            }})
        }
    }
    public render(): React.ReactNode {
        return (
            <Modal
                active={this.props.active}
                translate={{
                    x: `calc(${this.state.drag.translate.x}px + ${this.offset.x} + 55%)`,
                    y: `calc(${this.state.drag.translate.y}px - ${this.offset.y} - 55%)`
                }}
                zIndex={this.props.zIndex}
            >
                <div className={'dialog'} style={{
                    width: this.props.size?.width,
                    height: this.props.size?.height
                }}>
                    <div className={'dialogTitle'}
                         onMouseDown={(event) => {this.setState({drag: {
                             ...this.state.drag, state: true,
                             position: {
                                 x: event.clientX - this.state.drag.translate.x,
                                 y: event.clientY - this.state.drag.translate.y
                             }
                         }})}}
                         onMouseMove={this.changePosition}
                         onMouseOut={() => {this.setState({drag: {
                             ...this.state.drag, state: false
                         }})}}
                         onMouseUp={() => {this.setState({drag: {
                             ...this.state.drag, state: false
                         }})}}
                    >
                        <div>{this.props.title}</div>
                        <div onClick={this.props.close} style={{cursor: 'pointer'}}><CrossIcon/></div>
                    </div>
                    <ul className={'dialogMenu'}>
                        {Object.keys(this.props.tabs).map(name => {
                            if (name === this.state.activeTab) {
                                return (<li key={name} className={'dialogMenuTab active'}>{name}</li>)
                            } else {
                                return (<li key={name} className={'dialogMenuTab'} onClick={
                                    () => {this.setState({activeTab: name})}
                                }>{name}</li>)
                            }
                        })}
                    </ul>
                    <div className={'dialogActiveTab'}>
                        {this.props.tabs[this.state.activeTab]}
                    </div>
                </div>
            </Modal>
        )
    }
}
