import React from 'react';
import {
    AxesReal
} from '../../../single/Axes';
import AxesObjectTree from '../../../single/settings/objectTree/ObjectTree';

export default function GroupObjectTreeElement(
    {
        axes
    }: {
        axes: AxesReal
    }
) {
    return <>
        <tr className={'settings-header'}>
            <td colSpan={2}>
                {axes.name}
            </td>
        </tr>
        <tr className={'group object-tree-element'}>
            <td className={'indent'}></td>
            <td>
                <AxesObjectTree axes={axes}/>
            </td>
        </tr>
    </>;
}
