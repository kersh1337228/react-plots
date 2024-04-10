import {
    AxisData
} from '../../../../../utils/types/display';
import {
    AxesReal
} from '../Axes';
import AxisBase from '../../common/axis/base';
import { delta_ } from '../../../../../utils/constants/plot';

export default abstract class Axis extends AxisBase<
    AxesReal
> {
    public global: AxisData = {
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE,
        scale: 1,
        translate: 0
    };
    public local: AxisData = {
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE,
        scale: 1,
        translate: 0
    };
    public delta: AxisData = {
        min: delta_.min,
        max: delta_.max,
        scale: 0,
        translate: 0
    };

    public abstract init(): void;
    public abstract drawGrid(): void;
};
