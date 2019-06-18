import * as React from 'react';

interface NumberEditorProps{
    value: number;
    onChange: (value: number)=>void;
}
export const NumberEditor : React.FC<NumberEditorProps> = (props) => {
    return <input className="number-input" type="number" value={props.value}
        onChange={(e) => {
            const x = parseFloat(e.target.value);
            if (x !== props.value)
                props.onChange(x);
            }}
        />;
};
