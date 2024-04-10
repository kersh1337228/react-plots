import React from 'react';
import './ModalDynamic.css';

export default function ModalDynamic(
    {
        children,
        active,
        translate,
        zIndex
    }: {
        children: React.ReactElement;
        active: boolean;
        translate: {
            x: number | string,
            y: number | string
        };
        zIndex: number;
        hide?: () => void;
        placeholder?: React.JSX.Element | string;
    }
) {
    const t = {
        x: typeof translate.x === 'number' ?
            `${translate.x}px` : translate.x,
        y: typeof translate.y === 'number' ?
            `${translate.y}px` : translate.y
    };

    return  <div
        className={
            `modal-dynamic${active ? ' active' : ''}`
        }
        style={{
            transform: `translate(${t.x}, ${t.y})`,
            zIndex: zIndex
        }}
        onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
        }}
    >
        {children}
    </div>;
}
