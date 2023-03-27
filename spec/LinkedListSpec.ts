require("jasmine");
import { LinkedList, LLNode, Queue } from "../src/LinkedList";

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
    });
});

function checkConstantConditions(linkedList: LinkedList<number>) {
    expect(linkedList.first?.previous)
        .withContext("first.previous should always be undefined!")
        .toBe(undefined);

    expect(linkedList.last?.next)
        .withContext("last.next should always be undefined!")
        .toBe(undefined);
    
    expect(linkedList.getNodes().findLast())
        .withContext("The last node when iterating from the first should actually be the last node!")
        .toBe(linkedList.last);

    expect(linkedList.getNodesInReverse().findLast())
        .withContext("The last node when iterating from the end should actually be the first node!")
        .toBe(linkedList.first);

    let length = 0;
    for (const _ of linkedList) {
        length++;
    }
    expect(linkedList.length)
        .withContext("The length field should always match the actual length of the linked list when iterating")
        .toBe(length);

    for (const node of linkedList.getNodes()) {
        expect(node.list)
            .withContext("All nodes' lists should be the linked list!")
            .toBe(linkedList);
    }
}

describe("LinkedList", () => {
    describe("addItemFirst", () => {
        it("adds the item as both first and last if it is the first item", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(0);
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(0);
            expect(LL.length).toBe(1);
            checkConstantConditions(LL);
        });

        it("adds a second node in the correct place", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(1);
            LL.addItemFirst(0);
            // result: [0, 1]
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addNodeFirst", () => {
        it("adds the node as both first and last if it is the first item", () => {
            const LL = new LinkedList<number>();
            const newNode = new LLNode(0);
            LL.addNodeFirst(newNode);
            expect(LL.first).toBe(newNode);
            expect(LL.last).toBe(newNode);
            expect(LL.length).toBe(1);
            checkConstantConditions(LL);
        });

        it("adds a second node in the correct place", () => {
            const LL = new LinkedList<number>();
            LL.addNodeFirst(new LLNode(1));
            const newNode = new LLNode(0);
            LL.addNodeFirst(newNode);
            // result: [0, 1]
            expect(LL.first).toBe(newNode);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addItemLast", () => {
        it("adds the item as both first and last if it is the first item", () => {
            const LL = new LinkedList<number>();
            LL.addItemLast(0);
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(0);
            expect(LL.length).toBe(1);
            checkConstantConditions(LL);
        });

        it("adds a second node in the correct place", () => {
            const LL = new LinkedList<number>();
            LL.addItemLast(0);
            LL.addItemLast(1);
            // result: [0, 1]
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addNodeLast", () => {
        it("adds the node as both first and last if it is the first item", () => {
            const LL = new LinkedList<number>();
            const newNode = new LLNode(0);
            LL.addNodeLast(newNode);
            expect(LL.first).toBe(newNode);
            expect(LL.last).toBe(newNode);
            expect(LL.length).toBe(1);
            checkConstantConditions(LL);
        });

        it("adds a second node in the correct place", () => {
            const LL = new LinkedList<number>();
            const newNode = new LLNode(0);
            LL.addNodeLast(newNode);
            LL.addNodeLast(new LLNode(1));
            // result: [0, 1]
            expect(LL.first).toBe(newNode);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addItemAfter", () => {
        it("does nothing if the list is empty", () => {
            const LL = new LinkedList<number>();
            LL.addItemAfter(new LLNode(0), 1);
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);
            checkConstantConditions(LL);
        });

        it ("correctly adds an item to the list", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(0);
            LL.addItemAfter(LL.first!, 1);
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addNodeAfter", () => {
        it("does nothing if the list is empty", () => {
            const LL = new LinkedList<number>();
            LL.addNodeAfter(new LLNode(0), new LLNode(1));
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);
            checkConstantConditions(LL);
        });

        it ("correctly adds an item to the list", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(0);
            const newNode = new LLNode(1);
            LL.addNodeAfter(LL.first!, newNode);
            expect(LL.first!.item).toBe(0);
            expect(LL.last).toBe(newNode);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addItemBefore", () => {
        it("does nothing if the list is empty", () => {
            const LL = new LinkedList<number>();
            LL.addItemBefore(new LLNode(1), 0);
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);
            checkConstantConditions(LL);
        });

        it ("correctly adds an item to the list", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(1);
            LL.addItemBefore(LL.first!, 0);
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });

    describe("addNodeBefore", () => {
        it("does nothing if the list is empty", () => {
            const LL = new LinkedList<number>();
            LL.addNodeBefore(new LLNode(0), new LLNode(1));
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);
            checkConstantConditions(LL);
        });

        it ("correctly adds an item to the list", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(1);
            LL.addNodeBefore(LL.last!, new LLNode(0));
            expect(LL.first!.item).toBe(0);
            expect(LL.last!.item).toBe(1);
            expect(LL.length).toBe(2);
            checkConstantConditions(LL);
        });
    });


    describe("clear", () => {
        it("clears the list", () => {
            const LL = new LinkedList<number>();
            LL.addItemFirst(0);
            LL.addItemLast(2);
            LL.clear();
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);
            checkConstantConditions(LL);
        })
    });

    describe("removeItem", () => {
        it("Removes the first item that matches from the list", () => {
            const LL = new LinkedList<number>();
            LL.addItemLast(0);
            LL.addItemLast(1);
            LL.addItemLast(1);
            LL.removeItem(1);

            expect(LL.length).toBe(2);
            let arr = LL.toArray();
            for (let i=0; i < LL.length; i++) {
                expect(arr[i]).toBe(i);
            }
            checkConstantConditions(LL);
        });
    });

    describe("removeNode", () => {
        it("Removes the expected element", () => {
            const LL = new LinkedList<number>();
            LL.addItemLast(0);
            LL.addItemLast(1);
            const newNode = new LLNode(1);
            LL.addNodeLast(newNode);
            LL.removeNode(newNode);
    
            expect(LL.getNodes().every(node => node !== newNode)).toBe(true); 
        });
    });

    describe("removeFirst", () => {
        it("Removes the first element" ,() => {
            const LL = new LinkedList<number>();
            LL.addItemLast(0);
            LL.removeFirst();
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);

            LL.addItemLast(0);
            LL.addItemLast(1);
            LL.removeFirst();
            expect(LL.length).toBe(1);
            expect(LL.first?.item).toBe(1);
            expect(LL.first).toBe(LL.last);
        });
    });

    describe("removeLast", () => {
        it("Removes the last element" ,() => {
            const LL = new LinkedList<number>();
            LL.addItemLast(0);
            LL.removeLast();
            expect(LL.length).toBe(0);
            expect(LL.first).toBe(undefined);
            expect(LL.last).toBe(undefined);

            LL.addItemLast(0);
            LL.addItemLast(1);
            LL.removeLast();
            expect(LL.length).toBe(1);
            expect(LL.first?.item).toBe(0);
            expect(LL.first).toBe(LL.last);
        });
    });
});