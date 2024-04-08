import {
    AxesGroupReal
} from '../../AxesGroup';
import AxesGroupObjectTreeElement from './ObjectTreeElement';

export default function AxesGroupObjectTree(
    {
        group
    }: {
        group: AxesGroupReal
    }
) {
    return <table className={'group object-tree'}>
        <tbody>
            {group.axes.map((axes, index) =>
                <AxesGroupObjectTreeElement key={index} axes={axes}/>
            )}
        </tbody>
    </table>;
}
