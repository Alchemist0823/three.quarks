import React from "react";
import { List } from "semantic-ui-react";

interface SceneGraphViewProps {
    scene: THREE.Scene;
    onObjectClick?: (object3d: THREE.Object3D) => void;
}

interface SceneGraphViewState {
    openedIndex: Array<number>
}

export class SceneGraphView extends React.Component<SceneGraphViewProps, SceneGraphViewState> {


    constructor(props: Readonly<SceneGraphViewProps>) {
        super(props);
        this.state = {
            openedIndex: [0]
        }
    }

    renderObject(object3d: THREE.Object3D, index: number): [React.ReactNode, number] {
        let items = [];
        for (let child of object3d.children) {
            const result = this.renderObject(child, index);
            items.push(result[0]);
            index = result[1];
        }
        let output;
        if (items.length > 0) {
            output = <List.List>{items}</List.List>;
        }
        return ([
            <List.Item key={object3d.uuid} onClick={()=>this.onObjectClick(object3d)}>
                <List.Icon name='marker' />
                <List.Content>
                    <List.Header>Object {object3d.name}</List.Header>
                </List.Content>
                {output}
            </List.Item>,
        index]);
    }

    onObjectClick = (object3d: THREE.Object3D) => {
        if (this.props.onObjectClick)
            this.props.onObjectClick(object3d);
    };

    render() {
        return (<List>{this.renderObject(this.props.scene, 0)[0]}</List>);
    }
}
