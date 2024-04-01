import {
	DataObject,
	ObjectNumeric,
	ObjectTimeSeries,
	PlotData,
	PlotDataName,
	PointNumeric,
	PointTimeSeries,
	VectorizedPlotDataName
} from '../types/plotData';
import {
	DrawingProps
} from '../../components/plot/drawing/Drawing';

export function plotDataType(
	data: PlotData[]
): PlotDataName | undefined | never {
	if (!data.length)
		throw Error('Data is empty.');
	if (typeof (data[0] as PointNumeric)[0] === 'number')
		return 'PointNumeric';
	if (typeof (data[0] as PointTimeSeries)[0] === 'string')
		return 'PointTimeSeries';
	if (typeof (data[0] as ObjectNumeric)['timestamp'] === 'number')
		return 'ObjectNumeric';
	if (typeof (data[0] as ObjectTimeSeries)['timestamp'] === 'string')
		return 'ObjectTimeSeries';
	return undefined;
}

export function plotDataTypeVectorised(
	drawings: React.ReactElement<DrawingProps<any>>[]
): VectorizedPlotDataName | undefined {
	const dTypes = drawings.map(drawing => plotDataType(drawing.props.data));
	if (dTypes.every(
		dType => dType === 'PointNumeric'
			|| dType === 'ObjectNumeric'))
		return 'Numeric';
	if (dTypes.every(
		dType => dType === 'PointTimeSeries'
			|| dType === 'ObjectTimeSeries'))
		return 'TimeSeries';
	return undefined;
}

export function fillData(
	data: PlotData[],
	labels: number[] | string[]
): PlotData[] | never {
	const filled: PlotData[] = [];

	const dType = plotDataType(data);
	if (dType === 'PointNumeric' || dType === 'PointTimeSeries') {
		const labelsPresent = data.map(pair => pair[0]);

		let i = -1;
		for (const label of labels)
			if (!labelsPresent.includes(label)) // @ts-ignore
				filled.push([label, null]);
			else
				filled.push(data[++i]);
	} else if (dType === 'ObjectNumeric' || dType === 'ObjectTimeSeries') {
		const keys = Object.keys(data[0]).filter(field => field !== 'timestamp');
		const labelsPresent = (data as DataObject<any>[]).map(obj => obj.timestamp);

		const obj: DataObject<any> = {
			timestamp: null
		};
		for (const key of keys)
			obj[key] = null;

		let i = -1;
		for (const label of labels)
			if (!labelsPresent.includes(label))
				filled.push({
					...obj, // @ts-ignore
					timestamp: label
				});
			else
				filled.push(data[++i]);
	} else
		throw Error('Data type is undefined.');

	return filled;
}
