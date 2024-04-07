import {
    useState
} from 'react';
import Dialog from '../../../../misc/dialog/Dialog';
import SettingsIcon from '../../../../misc/icons/SettingsIcon';
import AxesObjectTree from './objectTree/ObjectTree';
import {
    AxesReal
} from '../Axes';
import {
    axisSize_
} from '../../../../../utils_refactor/constants/plot';
import './Settings.css';

export default function Settings(
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
        style={{
            width: axisSize_.width,
            height: axisSize_.height
        }}
    >
        <SettingsIcon onClick={() => {
            setActive(active => !active);
        }}/>
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
