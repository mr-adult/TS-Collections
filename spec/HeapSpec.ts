require("jasmine");

import { MinHeap, MaxHeap } from "../src/Heap";

describe("MinHeap", () => {
    it("Works as expected", () => {
        const heap1 = new MinHeap<number>();
        const heap2 = new MinHeap<number>();

        // Test adding the elements in both ascending and descending order
        for (let i = 0; i <= 100; i++) {
            heap1.push(i);
        }
        for (let i = 100; i >= 0; i--) {
            heap2.push(i);
        }

        for (const heap of [heap1, heap2]) {
            for (let i = 100; i >= 0; i--) {
                expect(heap.length).toEqual(i + 1);
                expect(heap.pop()).toEqual(100 - i);
            }
        }
    });
});

describe("MaxHeap", () => {
    it("Works as expected", () => {
        const heap1 = new MaxHeap<number>();
        const heap2 = new MaxHeap<number>();

        // Test adding the elements in both ascending and descending order
        for (let i = 0; i <= 100; i++) {
            heap1.push(i);
        }
        for (let i = 100; i >= 0; i--) {
            heap2.push(i);
        }

        for (const heap of [heap1, heap2]) {
            for (let i = 100; i >= 0; i--) {
                expect(heap.length).toEqual(i + 1);
                expect(heap.pop()).toEqual(i);
            }
        }
    });
});