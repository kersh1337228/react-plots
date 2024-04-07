import {
    AxesReal
} from '../../../single/Axes';
import AxesObjectTree from '../../../single/settings/objectTree/ObjectTree';

export default function AxesGroupObjectTreeElement(
    {
        axes
    }: {
        axes: AxesReal
    }
) {
    return <>
        <tr className={'axesSettingsHeader'}>
            <td>
                {axes.name}
            </td>
        </tr>
        <tr className={'groupObjectTreeElement'}>
            <td>
                <AxesObjectTree axes={axes}/>
            </td>
        </tr>
    </>;
}
