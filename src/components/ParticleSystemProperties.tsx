import * as React from "react";
import {ApplicationContextConsumer} from "./ApplicationContext";
import {GeneratorEditor, GenericGenerator, ValueType} from "./editors/GeneratorEditor";
import {ParticleSystem} from "../particle/ParticleSystem";
import {FunctionValueGenerator, ValueGenerator} from "../particle/functions/ValueGenerator";
import {ColorGenerator, FunctionColorGenerator} from "../particle/functions/ColorGenerator";


interface ParticleSystemPropertiesProps {
    particleSystem: ParticleSystem,
    updateProperties: Function,
}

interface ParticleSystemPropertiesState {

}

export class ParticleSystemProperties extends React.PureComponent<ParticleSystemPropertiesProps, ParticleSystemPropertiesState> {
    constructor(props: Readonly<ParticleSystemPropertiesProps>) {
        super(props);
    }

    onChangeStartSpeed = (g: GenericGenerator) => {
        console.log("change start speed");
        this.props.particleSystem.startSpeed = g as ValueGenerator | FunctionValueGenerator;
        this.props.updateProperties();
    };
    onChangeStartLife = (g: GenericGenerator) => {
        console.log("change start life");
        this.props.particleSystem.startLife = g as ValueGenerator | FunctionValueGenerator;
        this.props.updateProperties();
    };
    onChangeStartSize = (g: GenericGenerator) => {
        console.log("change start size");
        this.props.particleSystem.startSize = g as ValueGenerator | FunctionValueGenerator;
        this.props.updateProperties();
    };
    onChangeStartColor = (g: GenericGenerator) => {
        console.log("change start color");
        this.props.particleSystem.startColor = g as ColorGenerator | FunctionColorGenerator;
        this.props.updateProperties();
    };
    OnChangeStartRotation = (g: GenericGenerator) => {
        console.log("change start rotation");
        this.props.particleSystem.startRotation = g as ValueGenerator | FunctionValueGenerator;
        this.props.updateProperties();
    };

    render() {
        console.log('rendered objectProperties');
        const valueFunctionTypes = ['value', 'functionValue'] as Array<ValueType>;
        const colorValueFunctionTypes = ['color', 'functionColor'] as Array<ValueType>;
        return (
            <div>
                <ApplicationContextConsumer>
                    {context => context &&
                        <GeneratorEditor name="Start Life"
                                         allowedType={valueFunctionTypes}
                                         generator={this.props.particleSystem.startLife}
                                         updateGenerator={this.onChangeStartLife}/>
                    }
                </ApplicationContextConsumer>
                <ApplicationContextConsumer>
                    {context => context &&
                        <GeneratorEditor name="Start Size"
                                         allowedType={valueFunctionTypes}
                                         generator={this.props.particleSystem.startSize}
                                         updateGenerator={this.onChangeStartSize}/>
                    }
                </ApplicationContextConsumer>
                <ApplicationContextConsumer>
                    {context => context &&
                        <GeneratorEditor name="Start Speed"
                                         allowedType={valueFunctionTypes}
                                         generator={this.props.particleSystem.startSpeed}
                                         updateGenerator={this.onChangeStartSpeed}/>
                    }
                </ApplicationContextConsumer>
                <ApplicationContextConsumer>
                    {context => context &&
                        <GeneratorEditor name="Start Color"
                                         allowedType={colorValueFunctionTypes}
                                         generator={this.props.particleSystem.startColor}
                                         updateGenerator={this.onChangeStartColor}/>
                    }
                </ApplicationContextConsumer>
                <ApplicationContextConsumer>
                    {context => context &&
                        <GeneratorEditor name="Start Rotation"
                                         allowedType={valueFunctionTypes}
                                         generator={this.props.particleSystem.startRotation}
                                         updateGenerator={this.OnChangeStartRotation}/>
                    }
                </ApplicationContextConsumer>
            </div>
        );
    }
}
