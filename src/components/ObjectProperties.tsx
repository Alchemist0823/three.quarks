import * as React from "react";
import {Object3D} from "three";
import {NumberEditor} from "./NumberEditor";
import {ApplicationReactContext} from "./Application";


interface ObjectPropertiesProps {
    object3d: Object3D,
}

interface ObjectPropertiesState {

}

export class ObjectProperties extends React.Component<ObjectPropertiesProps, ObjectPropertiesState> {
    constructor(props: Readonly<ObjectPropertiesProps>) {
        super(props);
    }

    changeValue = (value: number) => {

    }

    render() {
        return (
        <ApplicationReactContext.Consumer>
        { context => context && (
            <div>
                <div>
                    <div>Position:</div>
                    <label>X:</label><NumberEditor value={this.props.object3d.position.x} onChange={value => {this.props.object3d.position.x = value; context.actions.updateProperties()}}/>
                    <label>Y:</label><NumberEditor value={this.props.object3d.position.y} onChange={value => {this.props.object3d.position.y = value; context.actions.updateProperties()}}/>
                    <label>Z:</label><NumberEditor value={this.props.object3d.position.z} onChange={value => {this.props.object3d.position.z = value; context.actions.updateProperties()}}/>
                </div>
                <div>
                    <div>Rotation:</div>
                    <label>X:</label><NumberEditor value={this.props.object3d.rotation.x} onChange={this.changeValue}/>
                    <label>Y:</label><NumberEditor value={this.props.object3d.rotation.y} onChange={this.changeValue}/>
                    <label>Z:</label><NumberEditor value={this.props.object3d.rotation.z} onChange={this.changeValue}/>
                </div>
                <div>
                    <div>Scale:</div>
                    <label>X:</label><NumberEditor value={this.props.object3d.scale.x} onChange={this.changeValue}/>
                    <label>Y:</label><NumberEditor value={this.props.object3d.scale.y} onChange={this.changeValue}/>
                    <label>Z:</label><NumberEditor value={this.props.object3d.scale.z} onChange={this.changeValue}/>
                </div>
            </div>
            )
        }

        </ApplicationReactContext.Consumer>
        );
    }
}
