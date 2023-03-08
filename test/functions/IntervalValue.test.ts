import {IntervalValue} from "../../src";

describe("IntervalValue", () => {
    test(".toJSON", () => {
        const intervalValue = new IntervalValue(0, 1);
        const json = intervalValue.toJSON();
        expect(json.type).toBe("IntervalValue");
        expect(json.a).toBe(0);
        expect(json.b).toBe(1);
    });

    test(".fromJSON", () => {
        const intervalValue = IntervalValue.fromJSON({type: "IntervalValue", a: 0, b: 1});
        expect(intervalValue.a).toBe(0);
        expect(intervalValue.b).toBe(1);
    });
});
