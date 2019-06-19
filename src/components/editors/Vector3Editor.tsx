import * as React from "react";
import {NumberInput} from "./NumberInput";

interface Vector3Props {
    name: string;
    x: number;
    y: number;
    z: number;
    onChange: (x: number, y: number, z: number)=>void;
    unitConversion?: number;
}

export class Vector3Editor extends React.PureComponent<Vector3Props> {
    render() {
        console.log('rendered Vector3');
        const {x, y, z, unitConversion = 1, onChange, name} = this.props;
        return(<div className="property">
                <label className="name">{name}</label>
                <label>X:</label><NumberInput value={x * unitConversion} onChange={value => {onChange(value / unitConversion, y, z)}}/>
                <label>Y:</label><NumberInput value={y * unitConversion} onChange={value => {onChange(x, value / unitConversion, z)}}/>
                <label>Z:</label><NumberInput value={z * unitConversion} onChange={value => {onChange(x, y, value / unitConversion)}}/>
            </div>
        );
    }
}