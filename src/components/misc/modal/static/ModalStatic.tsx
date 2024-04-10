import React from "react";
import './ModalStatic.css';

export default function ModalStatic(
    {
        children,
        active,
        hide,
        placeholder
    }: {
        children: React.ReactElement;
        active: boolean;
        hide?: () => void;
        placeholder?: React.JSX.Element | string;
    }
) {
    return <div className={'modal-static'}>
        <div
            className={
                `modal-background${active ? ' active' : ''}`
            }
            onClick={hide}
        >
            <div
                className={'modal-foreground'}
                onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                }}
            >
                {children}
            </div>
        </div>
        {placeholder}
    </div>;
}
