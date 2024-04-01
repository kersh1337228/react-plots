import {
    useState
} from 'react';
import Dialog from '../../../../misc/dialog/Dialog';
import SettingsIcon from '../../../../misc/icons/SettingsIcon';
import './AxesSettings.css';
import AxesObjectTree from './objectTree/AxesObjectTree';
import {
    AxesReal
} from '../Axes';
import { axisSize_ } from '../../../../../utils_refactor/constants/plot';

export default function AxesSettings(
    {
        axes,
        visible = true
    }: {
        axes: AxesReal,
        visible: boolean
    }
) {
    const [active, setActive] = useState(false);

    return visible ? <div
        className={'axesSettings'}
        onClick={() => {
            setActive(active => !active)
        }}
        style={{
            width: axisSize_.width,
            height: axisSize_.height
        }}
    >
        <SettingsIcon/>
        <Dialog
            title={axes.name}
            tabs={{
                'Object tree': <AxesObjectTree axes={axes} />
            }}
            active={active}
            close={() => {
                setActive(false);
            }}
            // size={{
            //     width: 200
            // }}
            zIndex={11}
        />
    </div> : <div
        className={'axesSettings'}
        style={{
            width: axisSize_.width,
            height: axisSize_.height
        }}
    >

    </div>;
}
