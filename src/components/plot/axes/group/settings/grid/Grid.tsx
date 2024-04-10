import React from 'react';
import {
    AxesGroupReal
} from '../../AxesGroup';
import GridTile from './GridTile';

export default function GroupGrid(
    {
        group
    }: {
        group: AxesGroupReal
    }
) {
    function drop(event: React.DragEvent) {
        const dragName = event.dataTransfer.getData('dropped'),
            dropName = (event.target as HTMLDivElement).innerHTML;

        const dragIndex = group.axes.findIndex(axes =>
            axes.name === dragName);
        const dropIndex = group.axes.findIndex(axes =>
            axes.name === dropName);

        const drag = group.axes[dragIndex],
            drop = group.axes[dropIndex];

        const position = structuredClone(drag.position),
            size = structuredClone(drag.size);

        drag.position = structuredClone(drop.position);
        drag.size = structuredClone(drop.size);
        drag.x.init();
        drag.y.init();
        group.axes[dropIndex] = drag;

        drop.position = position;
        drop.size = size;
        drop.x.init();
        drop.y.init();
        group.axes[dragIndex] = drop;

        group.rerender();
    }

    return <div
        className={'group component-grid'}
        style={{
            gridTemplateRows: `repeat(${group.rows - 1}, 1fr)`,
        }}
    >
        {group.axes.map((axes, i) =>
            <GridTile
                position={axes.position}
                key={i}
                dropHandler={drop}
            >
                {axes.name}
            </GridTile>
        )}
    </div>;
}