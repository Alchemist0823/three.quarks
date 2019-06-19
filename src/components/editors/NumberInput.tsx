import * as React from 'react';
import "./NumberInput.scss";

interface NumberInputProps{
    value: number;
    onChange: (value: number)=>void;
}

export const NumberInput : React.FC<NumberInputProps> = (props) => {

    const [inputValue, setInputValue] = React.useState(props.value + '');
    const [focus, setFocus] = React.useState(false);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (focus) {
            setInputValue(e.target.value);
        }
    };

    const onInputBlur = (e: React.FocusEvent) => {
        const x = parseFloat(inputValue);
        if (x !== props.value)
            props.onChange(x);
        setFocus(false);
    };

    const onInputFocus = (e: React.FocusEvent) => {
        if (inputValue !== props.value + '') {
            setInputValue(props.value + '');
        }
        setFocus(true);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        const x = parseFloat(inputValue);
        if (x !== props.value)
            props.onChange(x);
    };

    return <input className="number-input" value={focus? inputValue: props.value} size={5}
            onChange={onInputChange} onBlur={onInputBlur} onFocus={onInputFocus} onKeyDown={onKeyDown}
        />;
};
