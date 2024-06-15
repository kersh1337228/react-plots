import React from 'react';
import {
    AxesGroupReal
} from '../../AxesGroup';
import GroupObjectTreeElement from './ObjectTreeElement';

export default function GroupObjectTree(
    {
        group
    }: {
        group: AxesGroupReal
    }
) {
    return <table className={'group object-tree'}>
        <tbody>
            {group.axes.map((axes, index) =>
                <GroupObjectTreeElement key={index} axes={axes}/>
            )}
        </tbody>
    </table>;
}
