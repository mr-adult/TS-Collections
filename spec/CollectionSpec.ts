import jasmine = require("jasmine");
import { ExtendedIterable } from "../src/Collections";

class ArrayIterableForTesting<T> extends ExtendedIterable<T> {
    private _backingArray: T[];

    constructor(array: T[]) {
        super();
        this._backingArray = array;
    }

    [Symbol.iterator](): Iterator<T> {
        return this._backingArray[Symbol.iterator]();
    }
}

const createTestArr = function(): number[] {
    return [0, 1, 2, 3, 3, 4, 5, 6, 7, 8 , 9, 10, 11, 13, 12, 10];
}

const createTestIter = function(): ArrayIterableForTesting<number> {
    return new ArrayIterableForTesting(createTestArr());
}

describe("ExtendedIterable", () => {
    describe("length", () => {
        it("returns the length of the array" ,() => {
            expect(
                createTestArr().length
            )
            .withContext("expected the array iterable's length to be equal to its underlying array's length")
            .toBe(
                createTestIter().length
            );
        });
    });
});