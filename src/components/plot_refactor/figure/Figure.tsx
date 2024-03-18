'use client';

import React, { useState, useEffect, useRef } from 'react'
import {AxesReal} from '../axes/Axes'
import {AxesGroupReal} from '../axesGroup/AxesGroup'
import {ComponentChildren} from "../../../utils/types/reactObjects"
import {axisSize} from '../../../utils/constants/plot'
import NumberRange, {plotNumberRange} from "../../../utils/classes/iterable/NumberRange"
import DateTimeRange, {plotDateTimeRange} from "../../../utils/classes/iterable/DateTimeRange"
import {fillData, plotDataTypeVectorised} from "../../../utils/functions/plotDataProcessing"
import Drawing from "../drawings/Drawing/Drawing"
import {Geometrical, TimeSeries} from "../../../utils/types/plotData"
import './Figure.css'
import FigureSettings from "./settings/FigureSettings";

interface FigureProps {
	width: number
	height: number
	title: string
	children: React.JSX.Element | React.JSX.Element[]
}

interface FigureState {
	children: ComponentChildren<AxesReal | AxesGroupReal>
}

export default function Figure(
	{ children, width, height, title }: FigureProps
): React.JSX.Element {
	const childrenArray = Array.isArray(children) ? children : [children];

	const grid = {
		rows: Math.max.apply(null, Array.from(
			childrenArray, child => child.props.position.row.end
		)),
		columns: Math.max.apply(null, Array.from(
			childrenArray, child => child.props.position.column.end
		))
	};

	const cellWidth = width / (grid.columns - 1),
		cellHeight = height / (grid.rows - 1);

	const childrenModified = childrenArray.map((child, index) => {
		const childProps = {
			...child.props,
			xAxis: child.props.xAxis ?? true,
			yAxis: child.props.yAxis ?? true,
			padding: child.props.padding ?? {
				left: 0, top: 0, right: 0, bottom: 0, ...child.props.padding
			},
			size: {
				width: (
					child.props.position.column.end -
					child.props.position.column.start
				) * cellWidth - (
					child.props.yAxis === false ? 0 : axisSize.width
				),
				height: (
					child.props.position.row.end -
					child.props.position.row.start
				) * cellHeight - (
					child.props.xAxis === false ? 0 : axisSize.height
				)
			},
			key: index
		}
		if (child.type.name === 'Axes') {
			let xAxisData: NumberRange | DateTimeRange;
			let xAxisLabels: number[] | string[];
			const dType = plotDataTypeVectorised(child.props.drawings);
			if (child.props.drawings.length) {
				if (dType)
					if (dType === 'Geometrical') {
						xAxisData = plotNumberRange(
							child.props.drawings as Drawing<Geometrical, any, any>[]);
						xAxisLabels = [...xAxisData];
					} else {
						xAxisData = plotDateTimeRange(
							child.props.drawings as Drawing<TimeSeries, any, any>[]);
						xAxisLabels = [...xAxisData.format('%Y-%m-%d')];
					}
				else throw Error("<Axes> drawings must have uniform data type.")
			} else throw Error("<Axes> must contain at least one drawing.")
			const drawings = (child.props.drawings as Drawing<any, any, any>[]).map(drawing => {
				if (!drawing.global.data.length) throw Error('Drawing data can not be empty.')
				return new (Object.getPrototypeOf(drawing).constructor)(
					fillData(drawing.global.data, xAxisLabels), drawing.name,
					drawing.style, drawing.value_field
				)
			})
			return React.createElement(AxesReal, {...childProps, drawings, xAxisData})
		} else if (child.type.name === 'AxesGroup')
			return React.createElement(AxesGroupReal, childProps)
		else
			throw Error("Only <Axes> and <AxesGroup> can appear as <Figure> children.")
	});

	return <>
		<FigureSettings figure={this} />
		<div
			className={'figureGrid'}
			style={{ width: this.props.width, height: this.props.height }}
		>{this.state.children.nodes}</div>
	</>
}
