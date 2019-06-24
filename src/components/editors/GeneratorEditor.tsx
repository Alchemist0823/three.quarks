import * as React from "react";
import {FunctionValueGenerator, ValueGenerator} from "../../particle/functions/ValueGenerator";
import {ColorGenerator, ConstantColor, FunctionColorGenerator} from "../../particle/functions/ColorGenerator";
import {ConstantValue} from "../../particle/functions/ConstantValue";
import {Vector4} from "three";
import {IntervalValue} from "../../particle/functions/IntervalValue";
import {PiecewiseBezier} from "../../particle/functions/PiecewiseBezier";
import {ColorRange} from "../../particle/functions/ColorRange";
import {RandomColor} from "../../particle/functions/RandomColor";
import {Gradient} from "../../particle/functions/Gradient";
import {NumberInput} from "./NumberInput";
import {ColorEditor} from "./ColorEditor";
import "./GeneratorEditor.scss";

type EditorType =
    'constant'
    | 'intervalValue'
    | 'piecewiseBezier'
    | 'color'
    | 'randomColor'
    | 'colorRange'
    | 'gradient';
export type ValueType = 'value' | 'functionValue' | 'color' | 'functionColor';

const ValueToEditor: { [a: string]: Array<EditorType> } = {
    'value': ['constant', 'intervalValue'],
    'functionValue': ['piecewiseBezier'],
    'color': ['color', 'randomColor'],
    'functionColor': ['colorRange', 'gradient'],
};

export type GenericGenerator = ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator;

interface GeneratorEditorProps {
    allowedType: Array<ValueType>;
    name: string;
    generator: GenericGenerator;
    updateGenerator: (generator: GenericGenerator) => void;
}

interface GeneratorEditorState {
    open: boolean;
}

export class GeneratorEditor extends React.PureComponent<GeneratorEditorProps, GeneratorEditorState> {

    constructor(props: Readonly<GeneratorEditorProps>) {
        super(props);
        let currentEditor = ValueToEditor[props.allowedType[0]][0];
        this.state = {
            open: false,
        }
    }
    changeEditor = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const editorType = e.target.value;
        let generator: GenericGenerator | null = null;
        switch(editorType) {
            case "constant":
                generator = new ConstantValue(0);
                break;
            case "color":
                generator = new ConstantColor(new Vector4(1,1,1,1));
                break;
            case "intervalValue":
                generator = new IntervalValue(0, 1);
                break;
            case "colorRange":
                generator = new ColorRange(new Vector4(0,0,0,1), new Vector4(1,1,1,1));
                break;
            case "randomColor":
                generator = new RandomColor(new Vector4(0,0,0,1), new Vector4(1,1,1,1));
                break;
        }
        if (generator)
            this.props.updateGenerator(generator);
    }

    changeValue = (x: number) => {
        this.props.updateGenerator(new ConstantValue(x));
    };

    changeColor = (x: Vector4) => {
        this.props.updateGenerator(new ConstantColor(x));
    };

    changeValueA = (x: number) => {
        const interval = this.props.generator as IntervalValue;
        this.props.updateGenerator(new IntervalValue(x, interval.b));
    };

    changeValueB = (x: number) => {
        const interval = this.props.generator as IntervalValue;
        this.props.updateGenerator(new IntervalValue(interval.a, x));
    };

    changeColorRangeA = (x: Vector4) => {
        const colorRange = this.props.generator as ColorRange;
        this.props.updateGenerator(new ColorRange(x, colorRange.b));
    };
    changeColorRangeB = (x: Vector4) => {
        const colorRange = this.props.generator as ColorRange;
        this.props.updateGenerator(new ColorRange(colorRange.a, x));
    };
    changeRandomColorA = (x: Vector4) => {
        const randomColor = this.props.generator as RandomColor;
        this.props.updateGenerator(new RandomColor(x, randomColor.b));
    };
    changeRandomColorB = (x: Vector4) => {
        const randomColor = this.props.generator as RandomColor;
        this.props.updateGenerator(new RandomColor(randomColor.a, x));
    };

    getEditorType(generator: GenericGenerator): EditorType {
        if (generator instanceof ConstantValue) {
            return 'constant';
        } else if (generator instanceof IntervalValue) {
            return 'intervalValue';
        } else if (generator instanceof PiecewiseBezier) {
            return 'piecewiseBezier';
        } else if (generator instanceof ConstantColor) {
            return 'color';
        } else if (generator instanceof RandomColor) {
            return 'randomColor';
        } else if (generator instanceof ColorRange) {
            return 'colorRange';
        } else if (generator instanceof Gradient) {
            return 'gradient';
        }
        return 'constant';
    }

    render() {
        console.log('render GeneratorEditor');
        const {name, generator, allowedType} = this.props;

        let editorTypes = [];
        for (let valueType of allowedType) {
            console.log(valueType);
            console.log(ValueToEditor[valueType]);
            for (let editorType of ValueToEditor[valueType]) {
                editorTypes.push(editorType);
            }
        }

        let currentEditor = this.getEditorType(generator);

        let editor;
        switch (currentEditor) {
            case "constant":
                editor = <React.Fragment>
                    <NumberInput value={(generator as ConstantValue).value}
                                 onChange={this.changeValue}/></React.Fragment>;
                break;
            case "color":
                editor = (<React.Fragment>
                    <ColorEditor color={(generator as ConstantColor).color} onChange={this.changeColor}/>
                </React.Fragment>);
                break;
            case "intervalValue":
                editor = <React.Fragment>
                    <NumberInput value={(generator as IntervalValue).a}
                                 onChange={this.changeValueA}/>-<NumberInput
                        value={(generator as IntervalValue).b} onChange={this.changeValueB}/></React.Fragment>;
                break;
            case "colorRange":
                editor = (<React.Fragment>
                    <ColorEditor color={(generator as ColorRange).a} onChange={this.changeColorRangeA}/>-
                    <ColorEditor color={(generator as ColorRange).b} onChange={this.changeColorRangeB}/>
                </React.Fragment>);
                break;
            case "randomColor":
                editor = (<React.Fragment>
                    <ColorEditor color={(generator as RandomColor).a} onChange={this.changeRandomColorA}/>-
                    <ColorEditor color={(generator as RandomColor).b} onChange={this.changeRandomColorB}/>
                </React.Fragment>);
                break;
        }
        return <div className="property">
            <label className="name">{name}</label>
            {editor}
            <select className="editor-select" onChange={this.changeEditor}>
                {editorTypes.map(editorType => <option key={editorType} value={editorType} selected={currentEditor === editorType}>{editorType}</option>)}
            </select>
        </div>;
    }
}
