import React from "react";
import {TransformComponent, TransformProps} from "./TransformComponent";

interface HandleProps extends TransformProps {
    handleRadius: number,
    handleColor: string,
    hover: boolean,
    down: boolean,
    background: string,
    handleStroke: number,
    xstart: number,
    ystart: number,
    xval: number,
    yval: number,
    onMouseEnter: (event: React.MouseEvent)=>void,
    onMouseLeave: (event: React.MouseEvent)=>void,
    onMouseDown: (event: React.MouseEvent)=>void,
}

export class HandleComponent extends TransformComponent<HandleProps> {
    shouldComponentUpdate(nextProps: HandleProps) {
        if (super.shouldComponentUpdate(nextProps)) return true;
        const {
            xstart,
            ystart,
            handleRadius,
            handleColor,
            hover,
            down,
            background,
            handleStroke,
            xval,
            yval,
            onMouseEnter,
            onMouseLeave,
            onMouseDown
        } = this.props;
        return nextProps.xstart !== xstart ||
            nextProps.ystart !== ystart ||
            nextProps.handleRadius !== handleRadius ||
            nextProps.handleColor !== handleColor ||
            nextProps.hover !== hover ||
            nextProps.down !== down ||
            nextProps.background !== background ||
            nextProps.handleStroke !== handleStroke ||
            nextProps.xval !== xval ||
            nextProps.yval !== yval ||
            nextProps.onMouseDown !== onMouseDown ||
            nextProps.onMouseLeave !== onMouseLeave ||
            nextProps.onMouseEnter !== onMouseEnter;
    }

    render() {
        const { x, y } = this;
        const {
            xstart,
            ystart,
            handleRadius,
            handleColor,
            hover,
            down,
            background,
            handleStroke,
            xval,
            yval,
            onMouseEnter,
            onMouseLeave,
            onMouseDown
        } = this.props;

        const sx = x(xstart);
        const sy = y(ystart);
        const cx = x(xval);
        const cy = y(yval);
        const a = Math.atan2(cy-sy, cx-sx);
        const cxs = cx - handleRadius * Math.cos(a);
        const cys = cy - handleRadius * Math.sin(a);

        return <g>
            <line
                stroke={handleColor}
                strokeWidth={hover||down ? 1 + handleStroke : handleStroke}
                x1={cxs}
                y1={cys}
                x2={sx}
                y2={sy} />
            <circle
                cx={cx}
                cy={cy}
                r={handleRadius}
                stroke={handleColor}
                strokeWidth={down ? 2 * handleStroke : handleStroke}
                fill={down ? background: handleColor}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onMouseDown={onMouseDown} />
        </g>;
    }
}