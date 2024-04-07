import {
    AxesGroupReal
} from '../../AxesGroup';
import AxesGroupObjectTreeElement from './ObjectTreeElement';

export default function AxesGroupObjectTree(
    {
        axes
    }: {
        axes: AxesGroupReal
    }
) {
    return <table className={'groupObjectTree'}>
        <tbody>
            {axes.axes.map((axes, index) =>
                <AxesGroupObjectTreeElement key={index} axes={axes}/>
            )}
        </tbody>
    </table>;
}
