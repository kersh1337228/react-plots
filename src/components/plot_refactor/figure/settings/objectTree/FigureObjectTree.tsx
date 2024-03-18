import React from 'react'
import Figure from "../../Figure"
import FigureObjectTreeElement from "./FigureObjectTreeElement"

interface FigureObjectTreeProps { figure: Figure }

interface FigureObjectTreeState {}

export default function FigureObjectTree(): React.JSX.Element {
	return <ul className={'figureObjectTree'}>
		{this.props.figure.state.children.components.map((child, index) =>
			<FigureObjectTreeElement key={index} child={child}/>
		)}
	</ul>;
}
