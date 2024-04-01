import {
    AxisData
} from '../../../../../utils_refactor/types/display';
import {
    AxesReal
} from '../Axes';
import AxisBase from '../../common/axis/base';

export default abstract class Axis extends AxisBase<
    AxesReal
> {
    public readonly global: AxisData = {
        min: 0,
        max: 0,
        scale: 1,
        translate: 0
    };
    public local: AxisData = {
        min: 0,
        max: 0,
        scale: 1,
        translate: 0
    };
    public delta: AxisData = {
        min: 5,
        max: 500,
        scale: 0,
        translate: 0
    };

    public abstract drawGrid(): void;
};
