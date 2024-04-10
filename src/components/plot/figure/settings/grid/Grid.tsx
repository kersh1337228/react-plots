import GridTile from '../../../axes/group/settings/grid/GridTile';
import React, {
    useMemo
} from 'react';
import {
    AxesReal
} from '../../../axes/single/Axes';
import {
    AxesGroupReal
} from '../../../axes/group/AxesGroup';

export default function FigureGrid(
    {
        children,
        rerender
    }: {
        children: (AxesReal | AxesGroupReal)[],
        rerender: () => void
    }
) {
    function drop(event: React.DragEvent) {
        const dragName = event.dataTransfer.getData('dropped'),
            dropName = (event.target as HTMLDivElement).innerHTML;

        const dragIndex = children.findIndex(child =>
            child.name === dragName);
        const dropIndex = children.findIndex(child =>
            child.name === dropName);

        const drag = children[dragIndex],
            drop = children[dropIndex];

        const position = structuredClone(drag.position),
            size = structuredClone(drag.size);

        const wr = drag.size.width / drop.size.width;

        drag.position = structuredClone(drop.position);
        drag.size = structuredClone(drop.size);
        if (drag instanceof AxesReal) {
            drag.x.init();
            drag.y.init();

            drag.x.local.scale /= wr;
            drag.x.delta.scale /= wr;
            drag.x.local.translate /= wr;
            drag.x.delta.translate /= wr;
        } else {
            const cellHeight = size.height / drag.rows;
            for (const axes of drag.axes) {
                axes.size.width = drag.size.width;
                axes.size.height = (
                    axes.position.row.end -
                    axes.position.row.start
                ) * cellHeight - drag.axisSize.x / drag.rows;

                axes.x.init();
                axes.y.init();

                axes.x.local.scale /= wr;
                axes.x.delta.scale /= wr;
                axes.x.local.translate /= wr;
                axes.x.delta.translate /= wr;
            }
        }
        children[dropIndex] = drag;

        drop.position = position;
        drop.size = size;
        if (drop instanceof AxesReal) {
            drop.x.init();
            drop.y.init();

            drop.x.local.scale *= wr;
            drop.x.delta.scale *= wr;
            drop.x.local.translate *= wr;
            drop.x.delta.translate *= wr;
        } else {
            const cellHeight = size.height / drop.rows;
            for (const axes of drop.axes) {
                axes.size.width = drop.size.width;
                axes.size.height = (
                    axes.position.row.end -
                    axes.position.row.start
                ) * cellHeight - drop.axisSize.x / drop.rows;

                axes.x.init();
                axes.y.init();

                axes.x.local.scale *= wr;
                axes.x.delta.scale *= wr;
                axes.x.local.translate *= wr;
                axes.x.delta.translate *= wr;
            }
        }
        children[dragIndex] = drop;

        rerender();
    }

    const grid = useMemo(() => {
        return {
            rows: Math.max.apply(null, children.map(
                child => child.position.row.end)) - 1,
            columns: Math.max.apply(null, children.map(
                child => child.position.column.end)) - 1
        }
    }, [children]);

    return <div
        className={'figure component-grid'}
        style={{
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
            gridTemplateColumns: `repeat(${grid.columns}, 1fr)`
        }}
    >
        {children.map((child, i) =>
            <GridTile
                position={child.position}
                key={i}
                dropHandler={drop}
            >
                {child.name}
            </GridTile>
        )}
    </div>;
}
