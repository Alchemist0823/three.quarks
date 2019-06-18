import * as React from "react";
import {ColorResult, SketchPicker} from 'react-color';
import {FunctionValueGenerator, ValueGenerator} from "../particle/functions/ValueGenerator";
import {ColorGenerator, ConstantColor, FunctionColorGenerator} from "../particle/functions/ColorGenerator";
import {ConstantValue} from "../particle/functions/ConstantValue";
import {Color, Vector4} from "three";
import {IntervalValue} from "../particle/functions/IntervalValue";
import {PiecewiseBezier} from "../particle/functions/PiecewiseBezier";
import {ColorRange} from "../particle/functions/ColorRange";
import {RandomColor} from "../particle/functions/RandomColor";
import {Gradient} from "../particle/functions/Gradient";

type EditorType = 'constant' | 'intervalValue' | 'piecewiseBezier' | 'color' | 'randomColor' | 'colorRange' | 'gradient';
export type ValueType = 'value' | 'functionValue' | 'color' | 'functionColor';

const ValueToEditor: { [a: string]: Array<EditorType> } = {
    'value': ['constant', 'intervalValue'],
    'functionValue': ['piecewiseBezier'],
    'color': ['color', 'randomColor'],
    'functionColor': ['colorRange', 'gradient'],
};

interface ValueEditorProps {
    allowedType: Array<ValueType>;
    name: string;
    generator: ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator;
    updateGenerator: (generator: ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator) =>void;
}

interface ValueEditorState {
    currentEditor: EditorType;
    open: boolean;
}

function ConvertToColor(color: Vector4) {
    return `rgba(${((color.x * 255 ) | 0 )},${((color.y * 255 ) | 0 )},${((color.z * 255 ) | 0 )},${color.w})`;
}
//<SketchPicker />

export class ValueEditor extends React.Component<ValueEditorProps, ValueEditorState> {

    constructor(props: Readonly<ValueEditorProps>) {
        super(props);
        let currentEditor = ValueToEditor[props.allowedType[0]][0];
        if (props.generator instanceof ConstantValue) {
            currentEditor = 'constant';
        } else if (props.generator instanceof IntervalValue) {
            currentEditor = 'intervalValue';
        } else if (props.generator instanceof PiecewiseBezier) {
            currentEditor = 'piecewiseBezier';
        } else if (props.generator instanceof ConstantColor) {
            currentEditor = 'color';
        } else if (props.generator instanceof RandomColor) {
            currentEditor = 'randomColor';
        } else if (props.generator instanceof ColorRange) {
            currentEditor = 'colorRange';
        } else if (props.generator instanceof Gradient) {
            currentEditor = 'gradient';
        }

        this.state = {
            currentEditor: currentEditor,//ValueToEditor[props.allowedType[0]][0],
            open: false,
        }
    }

    togglePicker = () => {
        this.setState({ open: !this.state.open })
    };

    closePicker = () => {
        this.setState({ open: false })
    };

    colorChange = (colorResult: ColorResult) => {
        let color = new Vector4();
        color.x = Math.min( 255, colorResult.rgb.r ) / 255;
        color.y = Math.min( 255, colorResult.rgb.g ) / 255;
        color.z = Math.min( 255, colorResult.rgb.b ) / 255;
        color.w = colorResult.rgb.a!;
        this.props.updateGenerator(new ConstantColor(color));
    };

    changeValue = (e:React.ChangeEvent<HTMLInputElement>) => {
        let x = parseFloat(e.target.value);
        if (!Number.isNaN(x) && x !== (this.props.generator as ConstantValue).value)
            this.props.updateGenerator(new ConstantValue(x));
    };

    render() {
        const {name, generator} = this.props;

        const popover: React.CSSProperties = {
            position: 'absolute',
            zIndex: 2,
        };
        const cover: React.CSSProperties = {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        };

        let editor;
        switch (this.state.currentEditor) {
            case "constant":
                console.log('trigger');
                editor = <div><label>{name}</label><input type="number" value={(generator as ConstantValue).value} onChange={this.changeValue}/></div>;
                break;
            case "color":
                let color = (generator as ConstantColor).color;
                editor = (<div>
                    <label>{name}</label>
                    <button style={{backgroundColor: ConvertToColor(color), height: '20px'}} onClick={this.togglePicker} />{ConvertToColor(color)}
                    { this.state.open ? <div style={ popover }>
                        <div style={ cover } onClick={ this.closePicker }/>
                        <SketchPicker color={{r: ((color.x * 255 ) | 0 ), g: ((color.y * 255 ) | 0 ), b: ((color.z * 255 ) | 0 ), a: color.w}} onChange={ this.colorChange } />
                    </div> : null }
                </div>);
                break;
            case "intervalValue":
                break;
            case "colorRange":
                break;
        }
        return <div>{editor}</div>;
    }
}
