'use client';

import React from 'react';
import Drawing from '../../../../drawing/base/Drawing';
import SettingsIcon from '../../../../../misc/icons/SettingsIcon';
import Dialog from '../../../../../misc/dialog/Dialog';
import {
    useState
} from 'react';
import EyeIcon from '../../../../../misc/icons/EyeIcon';

export default function AxesObjectTreeElement(
    {
        drawing
    }: {
        drawing: Drawing<any, any>;
    }
) {
    const [active, setActive] = useState(false);

    return <tr className={'axes object-tree-element'}>
        <td>
            {drawing.constructor.name.replaceAll('Real', '')}
        </td>
        <td>
            {drawing.name}
        </td>
        <td>
            <SettingsIcon onClick={() => {
                setActive(active => !active);
            }}/>
            <Dialog
                title={drawing.name}
                tabs={{
                    Settings: drawing.settings()
                }}
                active={active}
                close={() => setActive(false)}
                zIndex={12}
            />
        </td>
        <td
            onClick={() => {
                const { axes } = drawing;
                drawing.visible = !drawing.visible;
                axes.active = axes.drawings
                    .some(drawing => drawing.visible);
                axes.localize({
                    start: axes.x.local.min / axes.x.global.max,
                    end: axes.x.local.max / axes.x.global.max,
                });
                axes.draw();
            }}
        >
            <EyeIcon visible={drawing.visible}/>
        </td>
    </tr>;
}
