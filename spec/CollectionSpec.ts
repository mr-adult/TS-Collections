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

    describe("at", () => {
        it("Returns the element at the index", () => {
            let arr = [0,1,2,3,4,5,undefined,null,0];
            let iterable = new WrappedIterable(arr);
            for (let i = 0; i < arr.length; i++) {
                expect(iterable.at(i)).toBe(arr[i]);
            }

            expect(iterable.at(arr.length)).toBe(undefined);
        });
    });

    describe("concat", () => {
        it("Concats 2 iterables together", () => {
            let arr1 = [0,1,2,3,4,5,6,7,8,undefined,null]
            let arr2 = [9,10,11,12,13,14,15,16,undefined,null]
            let iterable1 = new WrappedIterable(arr1);
            let iterable2 = new WrappedIterable(arr2);

            let concattedArr = arr1.concat(arr2);
            let concattedIter = iterable1.concat(iterable2);

            for (let i = 0; i < concattedArr.length; i++) {
                expect(concattedIter.at(i)).toBe(concattedArr[i]);
            }
            expect(concattedIter.at(concattedArr.length)).toBe(undefined);
        });
    });

    describe("empty", () => {
        it("Returns an iterable of 0 length", () => {
            expect(ExtendedIterable.empty().toArray().length).toBe(0);
        });
    });

    describe("every", () => {
        it("returns true if every element in the iterable meets the predicate", () => {
            let arr = [0,1,2,3,4,5,6,7,8,9,10];
            let iterable = new WrappedIterable(arr);
            expect(iterable.every(x => x < 11)).toBe(true);
            expect(iterable.every(x => x < 10)).toBe(false);

            expect(new WrappedIterable([undefined]).every(x => x === undefined)).toBe(true);
        });
    });

    describe("filter", () => {
        it("removes elements that don't meet the predicate", () => {
            let iterable = new WrappedIterable([0,1,2,3,4,5,6,7]);
            let filtered = iterable.filter(x => x > 0);
            expect(filtered.every(x => x > 0)).toBe(true);
            filtered = iterable.filter(x => x < 2);
            expect(filtered.every(x => x < 2)).toBe(true);

            expect(
                new WrappedIterable([undefined, undefined, undefined])
                    .filter(x => x === undefined)
                    .toArray()
                    .length
            ).toBe(3);
        });
    });
    
    describe("find", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });
    
    describe("findIndex", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });
    
    describe("findLast", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });
    
    describe("findLastIndex", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
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
    
    describe("flatMap", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });
    
    describe("forEach", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("includes", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("indexOf", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("join", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("lastIndexOf", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("map", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("reduce", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("reduceRight", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });

    describe("reverseOrder", () => {
        it("", () => {
            // TODO
            expect(true).toBe(true);
        });
    });
    describe("skip", () => {
        // TODO
        expect(true).toBe(true);
    });
});