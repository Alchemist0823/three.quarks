import * as React from "react";
import {Euler, Object3D, Vector3} from "three";
import {Vector3Editor} from "./editors/Vector3Editor";
import {ApplicationContextConsumer} from "./ApplicationContext";


interface ObjectPropertiesProps {
    object3d: Object3D,
    updateProperties: Function,
}

interface ObjectPropertiesState {

}

export class ObjectProperties extends React.PureComponent<ObjectPropertiesProps, ObjectPropertiesState> {
    constructor(props: Readonly<ObjectPropertiesProps>) {
        super(props);
    }

    onChangePosition = (x: number, y: number, z: number) => {
        this.props.object3d.position.set(x, y, z);
        this.props.updateProperties();
    };
    onChangeScale = (x: number, y: number, z: number) => {
        this.props.object3d.scale.set(x, y, z);
        this.props.updateProperties();
    };
    onChangeRotation = (x: number, y: number, z: number) => {
        this.props.object3d.rotation.set(x, y, z);
        this.props.updateProperties();
    };


    render() {
        console.log('rendered objectProperties');
        return (
            <div>
                <ApplicationContextConsumer>
                    {context => context &&
                        <Vector3Editor name="Position" x={this.props.object3d.position.x}
                                       y={this.props.object3d.position.y} z={this.props.object3d.position.z}
                                       onChange={this.onChangePosition}/>
                    }
                </ApplicationContextConsumer>
                <ApplicationContextConsumer>
                    {context => context &&
                        <Vector3Editor name="Rotation" x={this.props.object3d.rotation.x}
                                       y={this.props.object3d.rotation.y} z={this.props.object3d.rotation.z}
                                       onChange={this.onChangeRotation} unitConversion={180 / Math.PI}/>
                    }
                </ApplicationContextConsumer>
                <ApplicationContextConsumer>
                    {context => context &&
                        <Vector3Editor name="Scale" x={this.props.object3d.scale.x}
                                       y={this.props.object3d.scale.y} z={this.props.object3d.scale.z}
                                       onChange={this.onChangeScale}/>
                    }
                </ApplicationContextConsumer>
            </div>
        );
    }
}
