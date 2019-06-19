import React from "react";

function interp(a: number, b: number, x: number) {
    return a * (1 - x) + b * x;
}

export interface TransformProps {
    xFrom: number;
    yFrom: number;
    xTo: number;
    yTo: number;
}

export class TransformComponent<T extends TransformProps = TransformProps, K = {}> extends React.Component<T, K> {

    x = (value: number) => interp(this.props.xFrom, this.props.xTo, value);
    y = (value: number) => interp(this.props.yFrom, this.props.yTo, value);

    shouldComponentUpdate(nextProps: TransformProps) {
        const { xFrom, yFrom, xTo, yTo } = this.props;
        return (
            nextProps.xFrom !== xFrom ||
            nextProps.yFrom !== yFrom ||
            nextProps.xTo !== xTo ||
            nextProps.yTo !== yTo
        );
    }
}