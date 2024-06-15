import React from 'react';
import ObjectTreeElement from './ObjectTreeElement';
import {
    AxesReal
} from '../../Axes';

export default function AxesObjectTree(
    {
        axes
    }: {
        axes: AxesReal
    }
) {
    return <table className={'axes object-tree'}>
        <colgroup>
            <col span={1} width={128}/>
            <col span={1} width={128}/>
            <col span={1} width={14}/>
            <col span={1} width={16}/>
        </colgroup>
        <tbody>
            {axes.drawings.map(drawing =>
                <ObjectTreeElement drawing={drawing} key={drawing.name}/>
            )}
        </tbody>
    </table>;
}
