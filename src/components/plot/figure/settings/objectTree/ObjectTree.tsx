import {
    AxesReal
} from '../../../axes/single/Axes';
import {
    AxesGroupReal
} from '../../../axes/group/AxesGroup';
import FigureObjectTreeElement from './ObjectTreeElement';

export default function FigureObjectTree(
    {
        children
    }: {
        children: (AxesReal | AxesGroupReal)[]
    }
) {
    return <table className={'figure object-tree'}>
        <tbody>
            {children.map((child, i) =>
                <FigureObjectTreeElement
                    key={i}
                    child={child}
                />
            )}
        </tbody>
    </table>;
}
