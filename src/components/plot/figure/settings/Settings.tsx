'use client';

import React from 'react';
import SettingsIcon from '../../../misc/icons/SettingsIcon';
import Dialog from '../../../misc/dialog/Dialog';
import {
    AxesReal
} from '../../axes/single/Axes';
import {
    AxesGroupReal
} from '../../axes/group/AxesGroup';
import {
    useState
} from 'react';
import FigureObjectTree from './objectTree/ObjectTree';
import FigureGrid from './grid/Grid';
import './Settings.css';

export default function FigureSettings(
    {
        name,
        children,
        rerender,
        visible = false
    }: {
        name: string;
        children: (AxesReal | AxesGroupReal)[];
        rerender: () => void;
        visible?: boolean
    }
) {
    const [active, setActive] = useState(false);

    return visible ? <div className={'figure-settings'}>
        <div className={'figure-settings-header'}>
            <SettingsIcon
                onClick={() => setActive(active => !active)}
            />
            <h1>{name}</h1>
        </div>
        <Dialog
            title={name}
            tabs={{
                'Object Tree': <FigureObjectTree
                    children={children}
                />,
                'Components Grid': <FigureGrid
                    children={children}
                    rerender={rerender}
                />
            }}
            active={active}
            close={() => {
                setActive(false);
            }}
            zIndex={11}
            offset={{
                y: '-60%',
                x: '-55%'
            }}
        />
    </div> : null;
}
