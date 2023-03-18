require("jasmine");
import { TraversalType, NodeWithMetadata, TreeNode } from "../src/TreeNode";

class TreeNodeForTesting extends TreeNode<TreeNodeForTesting> {
    public value: number;
    public children?: TreeNodeForTesting[] | null;
    public numberOfGetChildrenCalls: number = 0;

    constructor(value: number, children?: TreeNodeForTesting[] | null) {
        super();
        this.value = value;
        this.children = children;
    }

    getChildren(): Iterable<TreeNodeForTesting> | null | undefined {
        this.numberOfGetChildrenCalls++;
        return this.children;
    }

    /**
     * Creates a tree with the following structure. 
     * We are using a deeply uneven tree in case that 
     * turns up any issues with the traversals.
     *         0
     *        / \
     *       1   2
     *      / \ / \
     *     3  4 5  6
     *            /
     *           7
     *            \
     *             8
     *            /
     *           9
     *            \
     *            10
     * @param emptyChildrenVal The value to use for an empty children list
     * @returns The root TreeNodeForTesting of the testing tree (value = 0)
     */
    public static createTreeForTesting(emptyChildrenVal?: (TreeNodeForTesting | null | undefined)[] | null) {
        return new TreeNodeForTesting(
            0,
            [
                new TreeNodeForTesting(1, [
                    new TreeNodeForTesting(3, emptyChildrenVal),
                    new TreeNodeForTesting(4, emptyChildrenVal)
                ]),
                new TreeNodeForTesting(2, [
                    new TreeNodeForTesting(5, emptyChildrenVal),
                    new TreeNodeForTesting(6, [
                        new TreeNodeForTesting(7, [
                            new TreeNodeForTesting(8, [
                                new TreeNodeForTesting(9, [
                                    new TreeNodeForTesting(10, emptyChildrenVal)
                                ])
                            ])
                        ])
                    ])
                ])
            ]
        );
    }
}

const expectedOrderDFS = " 0 1 3 4 2 5 6 7 8 9 10";
const expectedOrderBFS = " 0 1 2 3 4 5 6 7 8 9 10";
const expectedOrderDFSPostOrder = " 3 4 1 5 10 9 8 7 6 2 0"

describe("TreeNode", () => {
    describe("DFS", () => {
        for (const tree of createTreesForTesting()) {
            testIterable(tree.DFSWithMetadata(), expectedOrderDFS, TraversalType.DepthFirstPreorder);
        }
    });
});

describe("TreeNode", () => {
    describe("DFSPostorder", () => {
        for (const tree of createTreesForTesting()) {
            testIterable(tree.DFSPostorderWithMetadata(), expectedOrderDFSPostOrder, TraversalType.DepthFirstPostorder);
        }
    });
});

describe("TreeNode", () => {
    describe("Iterative Deepening BFS", () => {
        for (const tree of createTreesForTesting()) {
            testIterable(tree.BFSWithMetadata(), expectedOrderBFS, TraversalType.BreadthFirst);
        }
    });
});

describe("TreeNode", () => {
    describe("Queue BFS", () => {
        for (const tree of createTreesForTesting()) {
            testBFS(tree.BFSFast(), expectedOrderBFS, TraversalType.BreadthFirst);
        }
    });
});

function testIterable(iterable: Iterable<NodeWithMetadata<TreeNodeForTesting>>, expectedResult: string, traversalType: TraversalType) {
    it("Hits the nodes in the expected order", () => {
        let value = "";

        for(const nodeWithMetadata of iterable) {
            if (nodeWithMetadata.node === null || nodeWithMetadata.node === undefined) { continue; }

            value = value + ` ${nodeWithMetadata.node.value}`;
        }

        expect(value)
            .withContext(`The nodes were hit in the wrong order. ${value} was expected to match ${expectedResult}`)
            .toBe(expectedResult);
    });

    it("Has the correct length for its ancestors list", () => {
        const valueToDepthMap: Record<number, number> = {
            0: 0,
            1: 1,
            2: 1,
            3: 2,
            4: 2,
            5: 2,
            6: 2,
            7: 3,
            8: 4,
            9: 5,
            10: 6
        } as Record<number, number>;

        for(const nodeWithMetadata of iterable) {
            if (nodeWithMetadata.node === null || nodeWithMetadata.node === undefined) { continue; }

            expect(nodeWithMetadata.depth)
                .withContext(`Expected node with value ${nodeWithMetadata.node.value} to have a depth of ${valueToDepthMap[nodeWithMetadata.node.value]}, but instead had a depth of ${nodeWithMetadata.depth}.`)
                .toBe(valueToDepthMap[nodeWithMetadata.node.value]);

            expect(nodeWithMetadata.ancestors.length)
                .withContext(`Expected node with value ${nodeWithMetadata.node.value} to have an ancestors list of length ${valueToDepthMap[nodeWithMetadata.node.value]}, but instead it had a length of ${valueToDepthMap[nodeWithMetadata.node.value]}`)
                .toBe(valueToDepthMap[nodeWithMetadata.node.value])
        }
    })

    it("Has the correct ancestors list values", () => {
        for(const nodeWithMetadata of iterable) {
            if (nodeWithMetadata.node === null || nodeWithMetadata.node === undefined) { continue; }

            switch(nodeWithMetadata.node.value) {
                case 10:
                    expect(nodeWithMetadata.ancestors[5].value).toBe(9);
                case 9:
                    expect(nodeWithMetadata.ancestors[4].value).toBe(8);
                case 8:
                    expect(nodeWithMetadata.ancestors[3].value).toBe(7);
                case 7:
                    expect(nodeWithMetadata.ancestors[2].value).toBe(6);
                case 6:
                case 5:
                    expect(nodeWithMetadata.ancestors[1].value).toBe(2);
                case 2:
                    expect(nodeWithMetadata.ancestors[0].value).toBe(0);
                    break;
                case 4:
                case 3:
                    expect(nodeWithMetadata.ancestors[1].value).toBe(1);
                case 1:
                    expect(nodeWithMetadata.ancestors[0].value).toBe(0);
                    break;
            }
        }
    });

    it("Only calls getChildren() once per node in the tree", () => {
        if (traversalType === TraversalType.BreadthFirst) { return; }

        const resetGetChildrenCounters = function(node: TreeNodeForTesting) {
            if (!node) { return; }
            node.numberOfGetChildrenCalls = 0;
            node.children?.forEach(child => resetGetChildrenCounters(child));
        }
        
        // Reset the counter for the whole tree. We can't guarantee the order of Jasmine's calls, so
        // this makes sure we never get bad data.
        let root: TreeNodeForTesting;
        switch(traversalType) {
            case TraversalType.DepthFirstPreorder:
                // root is first
                root = iterable[Symbol.iterator]().next().value.node;
                break;
            case TraversalType.DepthFirstPostorder:
                // root is last
                for (const el of iterable) {
                    root = el.node;
                }
                break;
        }
        resetGetChildrenCounters(root);
        // Call the loop once to start racking up getChildren() calls
        for (const _ of iterable) {}
        // Check the value in loop #2
        for (const nodeWithMetadata of iterable) {
            if (!nodeWithMetadata.node) { continue; }
            expect(nodeWithMetadata.node.numberOfGetChildrenCalls)
                .withContext(`${traversalType === TraversalType.DepthFirstPreorder ? "DFSPreorder" : "DFSPostorder"} should only call getChildren once per node!`)
                .toBe(traversalType === TraversalType.DepthFirstPreorder ? 1 : 2);
        }
    });
}

function testBFS(iterable: Iterable<TreeNodeForTesting>, expectedResult: string, traversalType: TraversalType) {
    it("Hits the nodes in the expected order", () => {
        let value = "";

        for(const node of iterable) {
            if (node === null || node === undefined) { continue; }

            value = value + ` ${node.value}`;
        }

        expect(value)
            .withContext(`The nodes were hit in the wrong order. ${value} was expected to match ${expectedResult}`)
            .toBe(expectedResult);
    });

    it("Only calls getChildren() once per node in the tree", () => {
        if (traversalType === TraversalType.BreadthFirst) { return; }

        const resetGetChildrenCounters = function(node: TreeNodeForTesting) {
            node.numberOfGetChildrenCalls = 0;
            node.children?.forEach(child => resetGetChildrenCounters(child));
        }
        
        // Reset the counter for the whole tree. We can't guarantee the order of Jasmine's calls, so
        // this makes sure we never get bad data.
        resetGetChildrenCounters(iterable[Symbol.iterator]().next().value);
        for (const node of iterable) {
            expect(node.numberOfGetChildrenCalls)
                .withContext("BFSFast should only call getChildren once per node!")
                .toBe(1);
        }
    });
}

function createTreesForTesting(): TreeNodeForTesting[] {
    return [
        // Test that an empty iterable is handled correctly
        TreeNodeForTesting.createTreeForTesting([]),
        // Make sure we do the right thing with null/undefined
        TreeNodeForTesting.createTreeForTesting(undefined),
        TreeNodeForTesting.createTreeForTesting(null),
        // Make sure we don't crash if the caller has null/undefined in their "children" collection
        TreeNodeForTesting.createTreeForTesting([null]),
        TreeNodeForTesting.createTreeForTesting([undefined]),
    ];
}