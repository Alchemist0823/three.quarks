import {Vector3} from "three";
import {TextureSequencer} from "./TextureSequencer";

export interface Sequencer {
    transform(position: Vector3, index: number): void;

    toJSON(): any;

    clone(): Sequencer;
}

export function SequencerFromJSON(json: any): Sequencer {
    switch(json.type) {
        case 'TextureSequencer':
            return TextureSequencer.fromJSON(json);
        default:
            return new TextureSequencer();
    }
}
