import AxesObjectTree from '../../../axes/single/settings/objectTree/ObjectTree';
import {
    AxesReal
} from '../../../axes/single/Axes';
import {
    AxesGroupReal
} from '../../../axes/group/AxesGroup';
import GroupObjectTree from '../../../axes/group/settings/objectTree/ObjectTree';

export default function FigureObjectTreeElement(
    {
        child
    }: {
        child: AxesReal | AxesGroupReal
    }
) {
    return <>
        <tr className={'settings-header'}>
            <td colSpan={2}>
                {child.name}
            </td>
        </tr>
        <tr className={'figure object-tree-element'}>
            <td className={'indent'}></td>
            <td>
                {child instanceof AxesReal ?
                    <AxesObjectTree axes={child} /> :
                    <GroupObjectTree group={child} />
                }
            </td>
        </tr>
    </>;
}
