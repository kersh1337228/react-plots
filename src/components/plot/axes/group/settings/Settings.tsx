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
} from '../../../../../utils/constants/plot';
import './Settings.css';

export default function AxesGroupSettings(
    {
        group
    }: {
        group: AxesGroupReal
    }
) {
    const [active, setActive] = useState(false);

    return <div
        className={'group-settings'}
        style={{
            width: axisSize_.width,
            height: axisSize_.height,
            gridRowStart: group.rows + 1,
            gridRowEnd: group.rows + 2
        }}
    >
        <SettingsIcon onClick={() => {
            setActive(active => !active);
        }} />
        <Dialog
            title={group.name}
            tabs={{
                'Object Tree': <AxesGroupObjectTree group={group}/>,
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
