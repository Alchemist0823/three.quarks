import React from "react";
import {TransformComponent, TransformProps} from "./TransformComponent";
import {Bezier} from "../../particle/BezierCurvesValue";

export interface CurveProps extends TransformProps {
    curveColor: string;
    curveWidth: number;
    value: Bezier;
}

export class CurveComponent extends TransformComponent<CurveProps> {
    shouldComponentUpdate(nextProps: CurveProps) {
        if (super.shouldComponentUpdate(nextProps)) return true;
        const {
            curveColor,
            curveWidth,
            value
        } = this.props;
        const [p0, p1, p2, p3] = value.p;
        return nextProps.curveColor !== curveColor ||
            nextProps.curveWidth !== curveWidth ||
            nextProps.value !== value;
    }

    render() {
        const {
            curveColor,
            curveWidth,
            value
        } = this.props;
        const {x, y} = this;

        const segments = Math.floor((x(1) - x(0)) / 5);

        let curve = `M${x(0)},${y(value.genValue(0))} `;
        if (segments > 0) {
            for (let i = 1 / segments; i <= 1; i += 1 / segments) {
                curve += `L${x(i)},${y(value.genValue(i))} `;
            }
        }
        curve += `L${x(1)},${y(value.genValue(1))} `;

        return (<path
            fill="none"
            stroke={curveColor}
            strokeWidth={curveWidth}
            d={curve} />);
    }
}