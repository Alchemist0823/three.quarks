import React from "react";
import {AppContext, ApplicationContextConsumer} from "./ApplicationContext";
import {Object3D} from "three";
import {ParticleSystem} from "../particle/ParticleSystem";
import {ParticleEmitter} from "../particle/ParticleEmitter";
import './SceneGraphView.scss';

interface SceneGraphViewProps {
}

interface SceneGraphViewState {
    openedIndex: Array<number>
}

export class SceneGraphView extends React.PureComponent<SceneGraphViewProps, SceneGraphViewState> {


    constructor(props: Readonly<SceneGraphViewProps>) {
        super(props);
        this.state = {
            openedIndex: [0]
        }
    }

    renderObject(context: AppContext, object3d: THREE.Object3D, index: number, indent: number): [React.ReactNodeArray, number] {
        let items = [];

        let className = 'item';
        if (context.selection.indexOf(object3d) !== -1) {
            className += ' selected';
        }
        items.push(
            <li key={object3d.uuid} onClick={()=>this.onClick(context, object3d)} className={className} style={{marginLeft: indent + 'em'}}>
                {this.getObjectName(object3d)}
            </li>);
        index ++;
        for (let child of object3d.children) {
            const result = this.renderObject(context, child, index, indent + 1);
            items.push(result[0]);
            index = result[1];
        }
        return ([items, index]);
    }

    renderScene(context: AppContext, scene: THREE.Scene) {
        return <ul> {this.renderObject(context, scene, 0, 0)[0]} </ul>;
    }

    getObjectName(object3d: Object3D) {
        let type = 'object';
        if (object3d instanceof ParticleEmitter) {
            type = 'ParticleSystem';
        } else {
            type =  object3d.type;
        }
        let name = 'unnamed';
        if (object3d.name) {
            name = object3d.name;
        }
        return `[${type}] ${name}`;
    }

    render() {
        return (<ApplicationContextConsumer>
            {
                context => context && this.renderScene(context, context.scene)
            }
        </ApplicationContextConsumer>);
    }

    onClick = (context: AppContext, object3d: Object3D) => {
        //if (object3d.children.length === 0)
        context.actions.select(object3d);
    }
}
