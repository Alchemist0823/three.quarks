import * as React from "react";
import {Accordion} from "semantic-ui-react";
import {ConstantValue} from "../particle/functions/ConstantValue";
import {FunctionValueGenerator, ValueGenerator} from "../particle/functions/ValueGenerator";
import {ColorGenerator, ConstantColor, FunctionColorGenerator} from "../particle/functions/ColorGenerator";
import {Object3D, Vector4} from "three";
import {ObjectProperties} from "./ObjectProperties";
import {ApplicationContextConsumer} from "./ApplicationContext";
import {ParticleEmitter} from "../particle/ParticleEmitter";
import {ParticleSystemProperties} from "./ParticleSystemProperties";
import "./PropertiesEditor.scss";

interface PropertiesEditorProps {
    object3d: Object3D
}

interface PropertiesEditorState {
    activeIndex: number;
    value: string;
    valueGenerator: ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator
    colorGenerator: ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator
}

export class PropertiesEditor extends React.PureComponent<PropertiesEditorProps, PropertiesEditorState> {
    state = {
        activeIndex: 0,
        value: "1",
        valueGenerator: new ConstantValue(5),
        colorGenerator: new ConstantColor(new Vector4(1.0, 0, 0, 1))
    };

    render() {
        let panels = [];
        panels.push({
           key: 0,
           title: {
               icon: {name: 'dropdown'},
               content: "Object",
           },
           content: {
               children:
                    <ApplicationContextConsumer>
                        {context => context &&
                            <ObjectProperties object3d={this.props.object3d}
                                              updateProperties={context.actions.updateProperties}/>
                        }
                    </ApplicationContextConsumer>
            }
        });

        if (this.props.object3d instanceof ParticleEmitter) {
            const system = this.props.object3d.system;
            panels.push({
                key: 1,
                title: {
                    icon: {name: 'dropdown'},
                    content: "Particle Emitter",
                },
                content: {
                    children:
                        <ApplicationContextConsumer>
                            {context => context &&
                                <ParticleSystemProperties particleSystem={system}
                                                  updateProperties={context.actions.updateProperties}/>
                            }
                        </ApplicationContextConsumer>
                }
            });
        }
        return (
            <Accordion fluid styled panels={panels} exclusive={false}>
            </Accordion>
        );
    }
}
/*
<Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
    <Icon name='dropdown'/>
    Emission
</Accordion.Title>
<Accordion.Content active={activeIndex === 1}>
<div><GeneratorEditor name="startSpeed"
allowedType={['value', 'function'] as Array<ValueType>}
generator={this.state.valueGenerator}
updateGenerator={g => this.setState({valueGenerator: g})}/></div>
<div><GeneratorEditor name="startColor"
allowedType={['color', 'functionColor'] as Array<ValueType>}
generator={this.state.colorGenerator}
updateGenerator={g => this.setState({colorGenerator: g})}/></div>
</Accordion.Content>

<Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
    <Icon name='dropdown'/>
    Renderer
    </Accordion.Title>
    <Accordion.Content active={activeIndex === 2}>
</Accordion.Content>

<Accordion.Title active={activeIndex === 3} index={3} onClick={this.handleClick}>
    <Icon name='dropdown'/>
    Emission Shape
</Accordion.Title>
<Accordion.Content active={activeIndex === 3}>
<Select placeholder='Emitter' options={this.emitterOptions}/>
</Accordion.Content>*/