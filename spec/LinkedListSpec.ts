require("jasmine");
import { Queue } from "../src/LinkedList";

describe("Queue", () => {
    it("Behaves as expected", () => {
        const queue = new Queue<number>();
        for (let i = 0; i < 10; i++) {
            queue.enqueue(i);
        }

        for (let expectedValue = 0; expectedValue < 10; expectedValue++) {
            let actualValue = queue.dequeue();
            expect(actualValue)
                .withContext("Items should be dequeued in the same order they were enqueued")
                .toBe(expectedValue);
        }
    })
})