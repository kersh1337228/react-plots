import React from 'react';
import {
    ObjectNumeric,
    ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointNumeric, PointTimeSeries
} from '../../../../utils/types/plotData';
import {
    plotDataType
} from '../../../../utils/functions/plotDataProcessing';
import {
    AxesReal
} from '../../axes/single/Axes';
import PointNumericData from './data/point/numeric';
import DrawingData from './data/base';
import PointTimeSeriesData from './data/point/timeSeries';
import ObjectNumericData from './data/object/numeric';
import ObjectTimeSeriesData from './data/object/timeSeries';
import './Drawing.css';

export type DrawingProps<
    StyleT extends Record<string, any>
> = {
    data: PlotData[];
    name: string;
    style?: StyleT;
    vfield?: string;
};

export default abstract class Drawing<
    GeometryT extends Object,
    StyleT extends Record<string, any>
> {
    // @ts-ignore
    public axes: AxesReal;
    public data: DrawingData<any>;
    public visible: boolean = true;

    protected constructor(
        data: PlotData[],
        public readonly name: string,
        protected geometry: GeometryT,
        public style: StyleT,
        vField?: string,
        dataClass?: typeof DrawingData.prototype.constructor
    ) {
        if (dataClass) { // @ts-ignore
            this.data = new dataClass(this, data);
        } else {
            const dType = plotDataType(data) as PlotDataName;
            switch (dType) {
                case 'PointNumeric':
                    this.data = new PointNumericData(
                        this, data as PointNumeric[]);
                    break;
                case 'PointTimeSeries':
                    this.data = new PointTimeSeriesData(
                        this, data as PointTimeSeries[]);
                    break;
                case 'ObjectNumeric':
                    this.data = new ObjectNumericData(
                        this, data as ObjectNumeric[], vField as string);
                    break;
                case 'ObjectTimeSeries':
                    this.data = new ObjectTimeSeriesData(
                        this, data as ObjectTimeSeries[], vField as string);
            }
        }
    }

    public abstract draw(): void;

    public drawTooltip(
        _: number
    ) {};

    public settings(
        children?: React.ReactNode
    ) {
        return <table
            key={this.name}
            className={'drawing-settings'}
        >
            {children}
        </table>;
    }
}
