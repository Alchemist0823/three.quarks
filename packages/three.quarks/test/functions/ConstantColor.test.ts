import {ConstantColor} from "../../src";
import { Vector4 } from "three";

describe("ConstantColor", () => {
    test(".toJSON", () => {
        const constantColor = new ConstantColor(new Vector4(0, .25, .75, 1));
        const json = constantColor.toJSON();
        expect(json.color.r).toBe(0);
        expect(json.color.g).toBe(.25);
        expect(json.color.b).toBe(.75);
        expect(json.color.a).toBe(1);
        expect(json.type).toBe("ConstantColor");
    });

    test(".fromJSON", () => {
        const constantColor = ConstantColor.fromJSON({type: "ConstantColor", color: {r: 0, g: .25, b: .75, a: 1}});
        expect(constantColor.color.x).toBe(0);
        expect(constantColor.color.y).toBe(.25);
        expect(constantColor.color.z).toBe(.75);
        expect(constantColor.color.w).toBe(1);
    });
});
