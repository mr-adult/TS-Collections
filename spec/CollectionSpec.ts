require("jasmine");
import { ExtendedIterable, WrappedIterable } from "../src/Collections";

class ArrayIterableForTesting<T> extends ExtendedIterable<T> {
    private _backingArray: T[];

    constructor(array: T[]) {
        super();
        this._backingArray = array;
        if (this._enableDebugging) this._asArray = array;
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

describe("flat", () => {
    it("flattens an array", () => {
        const arr = new WrappedIterable([[0,1,2,3],[4,5,6],[7,8,9]]).flat().toArray();
        for (let i = 0; i < 10; i++) {
            expect(arr[i]).toBe(i);
        }
    });
});