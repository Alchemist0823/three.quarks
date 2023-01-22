import {Particle} from "../Particle";
import {Sequencer} from "./Sequencer";
import {Vector2, Vector3} from "three";

export class TextureSequencer implements Sequencer {
    locations: Vector2[] = [];

    constructor(public scaleX: number = 0, public scaleY: number = 0) {
    }
    transform(position: Vector3, index: number) {
        position.x = this.locations[index % this.locations.length].x * this.scaleX;
        position.y = this.locations[index % this.locations.length].y * this.scaleY;
        position.z = 0;
    }

    static fromJSON(json: any): Sequencer {
        let textureSequencer = new TextureSequencer(json.scaleX, json.scaleY);
        textureSequencer.locations = json.locations.map((loc: any) => new Vector2(loc.x, loc.y));
        return textureSequencer;
    }

    clone(): Sequencer {
        let textureSequencer = new TextureSequencer(this.scaleX, this.scaleY);
        textureSequencer.locations = this.locations.map(loc => loc.clone());
        return textureSequencer;
    }

    toJSON(): any {
        return {
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            locations: this.locations.map(loc => ({
                x: loc.x,
                y: loc.y,
            }))
        }
    }

    fromImage(img: CanvasImageSource, threshold: number) {
        // Create an empty canvas element
        let canvas = document.createElement("canvas");
        canvas.width = img.width as number;
        canvas.height = img.height as number;

        // Copy the image contents to the canvas
        let ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height, {colorSpace: "srgb"});
        canvas.remove();

        this.locations.length = 0;
        for (let i = 0; i < data.height; i ++) {
            for (let j = 0; j < data.width; j ++) {
                if (data.data[(i * data.width + j) * 4 + 3] > threshold) {
                    this.locations.push(new Vector2(j, data.height - i));
                }
            }
        }
        //return data;
        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        //var dataURL = canvas.toDataURL("image/png");

        //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
}
