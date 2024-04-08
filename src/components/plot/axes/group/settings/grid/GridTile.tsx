import React from 'react';
import {
    GridPosition
} from '../../../../../../utils/types/display';

export default function GridTile(
    {
        position,
        dropHandler,
        children
    }: {
        position: GridPosition,
        dropHandler: React.EventHandler<React.DragEvent>,
        children: React.ReactNode
    }
) {
    function dragStartHandler(event: React.DragEvent): void {
        event.dataTransfer.setData(
            'dropped',
            (event.target as HTMLDivElement).innerHTML
        );
    }

    function dragOverHandler(event: React.DragEvent): void {
        event.preventDefault();
    }

    function dragEnterHandler(event: React.DragEvent): void {
        event.preventDefault();
    }

    function dragLeaveHandler(_: React.DragEvent): void {}

    function dragEndHandler(_: React.DragEvent): void {}

    console.log(position.column.start, position.column.end)
    return <div
        className={'grid-tile'}
        style={{
            gridRowStart: position.row.start,
            gridRowEnd: position.row.end
        }}
        draggable={true}
        onDragStart={dragStartHandler}
        onDragOver={dragOverHandler}
        onDragEnter={dragEnterHandler}
        onDragLeave={dragLeaveHandler}
        onDragEnd={dragEndHandler}
        onDrop={dropHandler}
    >
        {children}
    </div>;
}
