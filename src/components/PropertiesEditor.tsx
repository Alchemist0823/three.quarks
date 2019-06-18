import * as React from "react";
import {Accordion, Button, Checkbox, Form, Icon, Input, ItemProps, Radio, Select, TextArea} from "semantic-ui-react";
import {ValueEditor, ValueType} from "./ValueEditor";
import {ConstantValue} from "../particle/functions/ConstantValue";
import {FunctionValueGenerator, ValueGenerator} from "../particle/functions/ValueGenerator";
import {ColorGenerator, ConstantColor, FunctionColorGenerator} from "../particle/functions/ColorGenerator";
import {Vector4} from "three";
import {ObjectProperties} from "./ObjectProperties";
import { ApplicationReactContext } from "./Application";

interface PropertiesEditorProps {

}

interface PropertiesEditorState {
    activeIndex: number;
    value: string;
    valueGenerator: ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator
    colorGenerator: ValueGenerator | FunctionValueGenerator | ColorGenerator | FunctionColorGenerator
}

export class PropertiesEditor extends React.Component<PropertiesEditorProps, PropertiesEditorState> {
    state = {
        activeIndex: 0,
        value: "1",
        valueGenerator: new ConstantValue(5),
        colorGenerator: new ConstantColor(new Vector4(1.0, 0, 0, 1))
    };

    handleClick = (e: React.MouseEvent, titleProps: ItemProps) => {
        const {index} = titleProps;
        const {activeIndex} = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({activeIndex: newIndex})
    };

    handleChange = (e: React.MouseEvent, {value}: ItemProps) => this.setState({value})


    emitterOptions = [
        {key: 'af', value: 'af', text: 'Sphere Emitter'},
        {key: 'ax', value: 'ax', text: 'Cone Emitter'},
        {key: 'ad', value: 'ad', text: 'Donut Emitter'},
    ];

    options = [
        {key: 'm', text: 'Male', value: 'male'},
        {key: 'f', text: 'Female', value: 'female'},
        {key: 'o', text: 'Other', value: 'other'},
    ];


    render() {
        const {activeIndex, value} = this.state;
        return (
        <ApplicationReactContext.Consumer>
            { context => context && (<Accordion fluid styled>

                <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                    <Icon name='dropdown'/>
                    Object
                </Accordion.Title>
                {context.selection.length > 0 && (<Accordion.Content active={activeIndex === 0}>
                    <ObjectProperties object3d={context.selection[0]} />
                </Accordion.Content>)}

                <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
                    <Icon name='dropdown'/>
                    Emission
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 1}>
                    <div><ValueEditor name="startSpeed"
                                      allowedType={['value', 'function'] as Array<ValueType>}
                                      generator={this.state.valueGenerator}
                                      updateGenerator={g => this.setState({valueGenerator: g})}/></div>
                    <div><ValueEditor name="startColor"
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
                </Accordion.Content>
            </Accordion>)}
        </ApplicationReactContext.Consumer>);
    }
}
