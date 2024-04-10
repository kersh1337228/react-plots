import {
    useState
} from 'react';
import {
    AxesGroupReal
} from '../AxesGroup';
import SettingsIcon from '../../../../misc/icons/SettingsIcon';
import Dialog from '../../../../misc/dialog/Dialog';
import GroupObjectTree from './objectTree/ObjectTree';
import {
    axisSize_
} from '../../../../../utils/constants/plot';
import './Settings.css';
import GroupGrid from './grid/Grid';

export default function AxesGroupSettings(
    {
        group,
        icon,
        visible
    }: {
        group: AxesGroupReal;
        icon: boolean;
        visible: boolean;
    }
) {
    const [active, setActive] = useState(false);

    if (visible)
        if (icon)
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
                }}/>
                <Dialog
                    title={group.name}
                    tabs={{
                        'Object Tree': <GroupObjectTree group={group}/>,
                        'Axes Grid': <GroupGrid group={group}/>
                    }}
                    active={active}
                    close={() => {
                        setActive(false);
                    }}
                    zIndex={11}
                />
            </div>;
        else
            return <div
                className={'group-settings placeholder'}
                style={{
                    width: axisSize_.width,
                    height: axisSize_.height,
                    gridRowStart: group.rows + 1,
                    gridRowEnd: group.rows + 2
                }}
            ></div>;
    else
        return null;
}
