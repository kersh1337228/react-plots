import AxesObjectTreeElement from './AxesObjectTreeElement';
import {
    AxesReal
} from '../../Axes';

export default function AxesObjectTree(
    {
        axes
    }: {
        axes: AxesReal
    }
) {
    return <table className={'objectTree'}>
        <tbody>
            {axes.drawings.map(drawing =>
                <AxesObjectTreeElement drawing={drawing} key={drawing.name}/>
            )}
        </tbody>
    </table>;
}
