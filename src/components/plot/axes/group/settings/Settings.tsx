import {
    useState
} from 'react';
import {
    AxesGroupReal
} from '../AxesGroup';
import SettingsIcon from '../../../../misc/icons/SettingsIcon';
import Dialog from '../../../../misc/dialog/Dialog';
import AxesGroupObjectTree from './objectTree/ObjectTree';
import {
    axisSize_
} from '../../../../../utils_refactor/constants/plot';
import './Settings.css';

export default function AxesGroupSettings(
    {
        axes
    }: {
        axes: AxesGroupReal
    }
) {
    const [active, setActive] = useState(false);

    return <div
        className={'axesGroupSettings'}
        style={{
            width: axisSize_.width,
            height: axisSize_.height,
            gridRowStart: axes.rows + 1,
            gridRowEnd: axes.rows + 2
        }}
    >
        <SettingsIcon onClick={() => {
            setActive(active => !active);
        }} />
        <Dialog
            title={axes.name}
            tabs={{
                'Object Tree': <AxesGroupObjectTree axes={axes}/>,
                // 'Axes Grid': <AxesGroupGrid axesGroup={this.props.axesGroup}/>
            }}
            active={active}
            close={() => {
                setActive(false);
            }}
            zIndex={11}
        />
    </div>;
}
