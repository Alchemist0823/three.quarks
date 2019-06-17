import * as React from "react";
import {CurveComponent} from "./CurveComponent";
import {PiecewiseBezier} from "../../particle/functions/PiecewiseBezier";
import {HandleComponent} from "./HandleComponent";
import {createRef} from "react";

interface BezierCurvesEditorProps {
    value: PiecewiseBezier
    onChange?: (value:PiecewiseBezier) => void,
    width: number,
    height: number,
    padding?: Array<number>,
    className?: string,
    background?: string,
    gridColor?: string,
    curveColor?: string,
    handleColor?: string,
    curveWidth?: number,
    handleRadius?: number,
    handleStroke?: number,
    readOnly?: boolean,
    style?: React.CSSProperties,
    pointers?: React.CSSProperties,
    textStyle?: React.CSSProperties,
}

interface BezierCurvesEditorState {
    curve: number,
    hover: number,
    down: number,
}

export class BezierCurvesEditor extends React.Component<BezierCurvesEditorProps, BezierCurvesEditorState> {


    static defaultP = {
        padding: [0, 0, 0, 0],
        handleRadius: 4,
    }; //[25, 5, 25, 18]

    constructor(props: Readonly<BezierCurvesEditorProps>) {
        super(props);
        this.state = {
            curve: -1,
            down: -1,
            hover: -1,
        };
    }

    rootRef = createRef<HTMLDivElement>();

    positionForEvent = (e: React.MouseEvent) => {
        if (this.rootRef.current) {
            const rect = this.rootRef.current.getBoundingClientRect();
            return [e.clientX - rect.left, e.clientY - rect.top];
        } else {
            return [0, 0];
        }
    };

    x = (value:number) => {
    };

    y = (value:number) => {
    };

    inversex = (x:number) => {
    };

    inversey = (y:number) => {
    };

    onDownLeave = (e: React.MouseEvent) => {
        if (this.state.down) {
            this.onDownMove(e);
            this.setState({
                down: -1,
                hover: -1
            });
        }
    };
    onDownMove = (e: React.MouseEvent) => {
        if (this.state.down >= 0) {
            e.preventDefault();
            const [x, y] = this.positionForEvent(e);
            const value = new PiecewiseBezier(this.props.value.functions);

            let valueX = x / this.props.width;
            let curveIndex = this.state.curve;
            let curve = value.getFunction(curveIndex);

            if (this.state.down === 0) {
                curve.p[0] = (this.props.height - y) / this.props.height;
                value.setStartX(curveIndex, x / this.props.width);
                if (curveIndex - 1 >= 0) {
                    value.getFunction(curveIndex - 1).p[3] = (this.props.height - y) / this.props.height;
                    value.setFunction(curveIndex - 1, value.getFunction(curveIndex - 1).clone());
                }
                value.setFunction(curveIndex, curve.clone());
            }
            if (this.state.down === 3) {
                curve.p[3] = (this.props.height - y) / this.props.height;
                value.setEndX(curveIndex, x / this.props.width);
                if (curveIndex + 1 < value.numOfFunctions) {
                    value.getFunction(curveIndex + 1).p[0] = (this.props.height - y) / this.props.height;
                    value.setFunction(curveIndex + 1, value.getFunction(curveIndex + 1).clone());
                }
                value.setFunction(curveIndex, curve.clone());
            }


            console.log(this.state.down);
            console.log(y);


            //value[i] = this.inversex(x);
            //value[i + 1] = this.inversey(y);
            if (this.props.onChange)
                this.props.onChange(value);
        }
    };

    onDownUp = () => {
        // this.onDownMove(e);
        this.setState({
            down: -1,
        });
    };


    onEnterHandle(curve: number, h: number) {
        if (!this.state.down) {
            this.setState({
                hover: h,
                curve: curve,
            });
        }
    }
    onDownHandle(curve: number, h: number, e: React.MouseEvent) {
        e.preventDefault();
        this.setState({
            hover: -1,
            down: h,
            curve: curve,
        });
    }

    onLeaveHandle() {
        if (!this.state.down) {
            this.setState({
                hover: -1,
            });
        }
    }

    render() {

        const {
            width,
            height,
            value,
            curveWidth = 1,
            curveColor = "#fff",
            handleRadius = BezierCurvesEditor.defaultP.handleRadius,
            handleColor = "#f00",
            handleStroke = 1,
            background = "#fff",
        } = this.props;

        const {
            curve: curveIndex,
            down,
            hover
        } = this.state;

        let curves = [];
        for (let i = 0; i < value.numOfFunctions; i ++) {
            let x1 = value.getStartX(i);
            let x2 = value.getEndX(i);
            let curve = value.getFunction(i);
            let slope0 = curve.derivative(0);
            let slope1 = curve.derivative(1);

            curves.push(
                <g key={i}>
                    <CurveComponent xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        curveColor={curveColor} curveWidth={curveWidth} value={curve}/>
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 0, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 0)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={0}
                        ystart={curve.p[0]}
                        xval={0}
                        yval={curve.p[0]}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 0}
                        hover={curveIndex === i && hover === 0}
                        handleStroke={handleStroke}
                        background={background}
                    />
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 1, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 1)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={0}
                        ystart={curve.p[0]}
                        xval={0.3 / Math.sqrt(slope0 * slope0 + 1)}
                        yval={0.3 * slope0 / Math.sqrt(slope0 * slope0 + 1) + curve.p[0]}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 1}
                        hover={curveIndex === i && hover === 1}
                        handleStroke={handleStroke}
                        background={background}
                    />
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 2, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 2)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={1}
                        ystart={curve.p[3]}
                        xval={1 - 0.3 / Math.sqrt(slope1 * slope1 + 1)}
                        yval={curve.p[3] - 0.3 * slope1/ Math.sqrt(slope1 * slope1 + 1)}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 2}
                        hover={curveIndex === i && hover === 2}
                        handleStroke={handleStroke}
                        background={background}
                    />
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 3, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 3)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={1}
                        ystart={curve.p[3]}
                        xval={1}
                        yval={curve.p[3]}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 3}
                        hover={curveIndex === i && hover === 3}
                        handleStroke={handleStroke}
                        background={background}
                    />
                </g>);
        }
        return <div ref={this.rootRef}
                    onMouseMove={this.onDownMove}
                    onMouseUp={this.onDownUp}
                    onMouseLeave={this.onDownLeave}>
            <svg width={width} height={height}>
                {curves}
            </svg>
        </div>;
    }
}
