import * as React from 'react';
import {ColorResult, SketchPicker} from "react-color";
import {Vector4} from "three";
import "./ColorEditor.scss";

interface ColorEditorProps {
    color: Vector4;
    onChange: (color: Vector4) => void;
}

function ConvertToColor(color: Vector4) {
    return `rgba(${((color.x * 255) | 0)},${((color.y * 255) | 0)},${((color.z * 255) | 0)},${color.w})`;
}

export const ColorEditor: React.FC<ColorEditorProps> = (props) => {
    const [open, setOpen] = React.useState(false);

    const togglePicker = () => {
        setOpen(!open);
    };

    const closePicker = () => {
        setOpen(false);
    };

    const colorChange = (colorResult: ColorResult) => {
        let color = new Vector4();
        color.x = Math.min(255, colorResult.rgb.r) / 255;
        color.y = Math.min(255, colorResult.rgb.g) / 255;
        color.z = Math.min(255, colorResult.rgb.b) / 255;
        color.w = colorResult.rgb.a!;
        onChange(color);
    };

    const {color, onChange} = props;

    return (
        <div className="color-editor">
            <button style={{backgroundColor: ConvertToColor(color), height: '20px'}} onClick={togglePicker}/>
            {ConvertToColor(color)}
            {
                open ? <div className="popover">
                    <div className="cover" onClick={closePicker}/>
                    <SketchPicker
                        color={{
                            r: ((color.x * 255) | 0),
                            g: ((color.y * 255) | 0),
                            b: ((color.z * 255) | 0),
                            a: color.w
                        }}
                        onChange={colorChange}/>
                </div> : null
            }
        </div>);
};
