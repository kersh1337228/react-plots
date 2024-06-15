'use client';

import {
    useState
} from 'react';
import Dialog from '../../../../misc/dialog/Dialog';
import SettingsIcon from '../../../../misc/icons/SettingsIcon';
import AxesObjectTree from './objectTree/ObjectTree';
import {
    AxesReal
} from '../Axes';
import {
    axisSize_
} from '../../../../../utils/constants/plot';
import './Settings.css';

export default function AxesSettings(
    {
        axes,
        icon,
        visible
    }: {
        axes: AxesReal;
        icon: boolean;
        visible: boolean;
    }
) {
    const [active, setActive] = useState(false);

    if (visible)
        if (icon)
            return <div
                className={'axes-settings'}
                style={{
                    width: axisSize_.width,
                    height: axisSize_.height
                }}
            >
                <SettingsIcon onClick={() => {
                    setActive(active => !active);
                }}/>
                <Dialog
                    title={axes.name}
                    tabs={{
                        'Object tree': <AxesObjectTree axes={axes}/>
                    }}
                    active={active}
                    close={() => {
                        setActive(false);
                    }}
                    zIndex={11}
                />
            </div>;
        else
            return <div
                className={'axes-settings placeholder'}
                style={{
                    width: axisSize_.width,
                    height: axisSize_.height
                }}
            ></div>;
    else
        return null;
}
