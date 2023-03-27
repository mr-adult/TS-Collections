require("jasmine");
import { ExtendedIterable, WrappedIterable } from "../src/Collections";
import { BinaryTreeNode, NodeWithMetadata, TreeNode } from "../src/TreeNode";

// #region if this throws TS errors, it means our library is leaking nulls!
// We don't actually want to run this code, just let the TS type checker hit it
if (false) {
    class NonNullTreeNode extends TreeNode<NonNullTreeNode> {
        getChildren(): Iterable<NonNullTreeNode> {
            return ExtendedIterable.empty<NonNullTreeNode>();
        }
    }
    
    const node = new NonNullTreeNode();
    new WrappedIterable(node.getChildren()).map(node => node.getChildren());
    const allBasicIterationTypes = [node.BFS(), node.BFSFast(), node.DFS(), node.DFSPostorder()];
    const allMetadataIterationType = [node.BFSWithMetadata(), node.BFSFastWithMetadata(), node.DFSWithMetadata(), node.DFSPostorderWithMetadata()]
    for (const iterable of allBasicIterationTypes) {
        for (const item of iterable) { item.getChildren(); }
    }
    for (const iterable of allMetadataIterationType) {
        for (const item of iterable) { item.node.getChildren(); }
    }

    class NonNullBinaryTreeNode extends BinaryTreeNode<NonNullBinaryTreeNode> {
        getLeft(): NonNullBinaryTreeNode {
            return {} as NonNullBinaryTreeNode;
        }
        getRight(): NonNullBinaryTreeNode {
            return {} as NonNullBinaryTreeNode;
        }
    }

    const binaryNode = new NonNullBinaryTreeNode();
    for (const item of binaryNode.DFSInOrder()) { 
        item.getLeft(); 
        item.getRight();
    }
    for (const item of binaryNode.DFSInOrderWithMetadata()) { 
        item.node.getLeft(); 
        item.node.getRight();
    }
}
// #endregion


class TreeNodeForTesting extends TreeNode<TreeNodeForTesting | null | undefined> {
    public value: number;
    public children?: (TreeNodeForTesting | null | undefined)[] | null;
    public numberOfGetChildrenCalls: number = 0;

    constructor(value: number, children?: (TreeNodeForTesting | null | undefined)[] | null) {
        super();
        this.value = value;
        this.children = children;
    }

    getChildren(): Iterable<TreeNodeForTesting | null | undefined> | null | undefined {
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

class BinaryTreeNodeForTesting extends BinaryTreeNode<BinaryTreeNodeForTesting> {
    public value: number;
    public left: BinaryTreeNodeForTesting | null | undefined;
    public right: BinaryTreeNodeForTesting | null | undefined;
    public numberOfGetLeftCalls: number = 0;
    public numberOfGetRightCalls: number = 0;

    constructor(value: number, left: BinaryTreeNodeForTesting | null | undefined, right: BinaryTreeNodeForTesting | null | undefined) {
        super();
        this.value = value;
        this.left = left;
        this.right = right;
    }

    public getLeft(): BinaryTreeNodeForTesting | null | undefined {
        this.numberOfGetLeftCalls++;
        return this.left;
    }

    public getRight(): BinaryTreeNodeForTesting | null | undefined {
        this.numberOfGetRightCalls++;
        return this.right;
    }

    public static createTreeForTesting(emptyValue: null | undefined) {
        return new BinaryTreeNodeForTesting(0,
            new BinaryTreeNodeForTesting(1,
                new BinaryTreeNodeForTesting(3, 
                    emptyValue, 
                    emptyValue
                ),
                new BinaryTreeNodeForTesting(4, 
                    emptyValue, 
                    emptyValue
                )
            ),
            new BinaryTreeNodeForTesting(2,
                new BinaryTreeNodeForTesting(5, 
                    emptyValue, 
                    emptyValue
                ),
                new BinaryTreeNodeForTesting(6, 
                    new BinaryTreeNodeForTesting(7, 
                        emptyValue, 
                        new BinaryTreeNodeForTesting(8, 
                            new BinaryTreeNodeForTesting(9,
                                emptyValue, 
                                new BinaryTreeNodeForTesting(10, 
                                    emptyValue, 
                                    emptyValue
                                )
                            ), 
                            emptyValue
                        )
                    ),
                    emptyValue
                )
            )
        )
    }
}

const expectedOrderDFS = " 0 1 3 4 2 5 6 7 8 9 10";
const expectedOrderBFS = " 0 1 2 3 4 5 6 7 8 9 10";
const expectedOrderDFSPostOrder = " 3 4 1 5 10 9 8 7 6 2 0"
const expectedOrderDFSInOrder = " 3 1 4 0 5 2 7 9 10 8 6"

describe("TreeNode", () => {
    describe("DFS", () => {
        for (const root of createTreesForTesting()) {
            testMetadataIterable(
                "DFSWithMetadata", 
                root, 
                root.DFSWithMetadata(), 
                expectedOrderDFS
            );
            getChildrenOnlyCalledOnce(
                "DFSWithMetadata", 
                root, 
                root.DFSWithMetadata()
            );

            testNodeIterable(
                "DFS",
                root,
                root.DFS(),
                expectedOrderDFS,
                true
            );
        }
    });

    describe("DFSInOrder", () => {
        for (const root of createBinaryTreesForTesting()) {
            testMetadataIterable(
                "DFSInOrderWithMetadata",  
                root, 
                root.DFSWithMetadata(), 
                expectedOrderDFS
            );

            it("Hits the nodes in the expected order", () => {
                let value = "";

                for(const node of root.DFSInOrder()) {
                    if (node === null || node === undefined) { continue; }
        
                    value = value + ` ${node.value}`;
                }
        
                expect(value)
                    .withContext(`The nodes were hit in the wrong order. ${value} was expected to match ${expectedOrderDFSInOrder}`)
                    .toBe(expectedOrderDFSInOrder);
            });

            it("Only calls getLeft and getRight once per node", () => {
                function resetCounts(node: BinaryTreeNodeForTesting) {
                    node.numberOfGetLeftCalls = 0;
                    node.numberOfGetRightCalls = 0;
                    for (const child of [node.left, node.right]) {
                        if (!child) { continue; }
                        resetCounts(child);
                    }
                }
                resetCounts(root);

                for (const node of root.DFSInOrder()) {
                    // getLeft gets called before the traversal
                    expect(node.numberOfGetLeftCalls).toBe(1);
                    // getRight gets called after the traversal
                    expect(node.numberOfGetRightCalls).toBe(0);
                }
            })
        }
    });

    describe("DFSPostorder", () => {
        for (const root of createTreesForTesting()) {
            testMetadataIterable(
                "DFSPostorderWithMetadata",
                root,
                root.DFSPostorderWithMetadata(), 
                expectedOrderDFSPostOrder
            );
            getChildrenOnlyCalledOnce(
                "DFSPostorderWithMetadata",
                root,
                root.DFSPostorderWithMetadata()
            );

            testNodeIterable(
                "DFSPostorder",
                root,
                root.DFSPostorder(),
                expectedOrderDFSPostOrder,
                true
            );
        }
    });

    describe("Iterative Deepening BFS", () => {
        for (const root of createTreesForTesting()) {
            testMetadataIterable(
                "BFSWithMetadata",
                root,
                root.BFSWithMetadata(), 
                expectedOrderBFS
            );

            testNodeIterable(
                "BFS",
                root,
                root.BFS(),
                expectedOrderBFS,
                false
            );
        }
    });

    describe("Queue BFS", () => {
        for (const root of createTreesForTesting()) {
            it("Has the correct ancestors list values", () => {
                for(const nodeWithBackPath of root.BFSFastWithMetadata()) {
                    if (!nodeWithBackPath.node) { continue; }
                    let iterator = nodeWithBackPath.ancestors[Symbol.iterator]();
                    
                    let iterResult: IteratorResult<TreeNodeForTesting | null | undefined>;
                    switch(nodeWithBackPath.node.value) {
                        case 10:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(9);
                        case 9:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(8);
                        case 8:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(7);
                        case 7:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(6);
                        case 6:
                        case 5:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(2);
                        case 2:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(0);
                            
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should be finished!")
                                .toBe(true);
                            expect(iterResult.value).toBe(undefined);
                            break;
                        case 3:
                        case 4:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should not be finished!")
                                .toBe(false);
                            expect(iterResult.value!.value).toBe(1);
                        case 1:
                            iterResult = iterator.next();
                            expect(iterResult.done).toBe(false);
                            expect(iterResult.value!.value).toBe(0);
                        case 0:
                            iterResult = iterator.next();
                            expect(iterResult.done)
                                .withContext("iterator should be finished!")
                                .toBe(true);
                            expect(iterResult.value).toBe(undefined);
                            break;
                    }
                }
            });

            testNodeIterable(
                "BFSFast", 
                root,
                root.BFSFast(), 
                expectedOrderBFS, 
                true
            );
        }
    });
});

function testMetadataIterable(methodName: string, _root: TreeNodeForTesting | BinaryTreeNodeForTesting, iterable: Iterable<NodeWithMetadata<TreeNodeForTesting | BinaryTreeNodeForTesting | null | undefined>>, expectedResult: string) {
    it("Hits the nodes in the expected order", () => {
        let value = "";

        for(const nodeWithMetadata of iterable) {
            if (nodeWithMetadata.node === null || nodeWithMetadata.node === undefined) { continue; }

            value = value + ` ${nodeWithMetadata.node.value}`;
        }

        expect(value)
            .withContext(`The nodes were hit in the wrong order for ${methodName}. ${value} was expected to match ${expectedResult}`)
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
                .toBe(valueToDepthMap[nodeWithMetadata.node.value]!);

            expect(nodeWithMetadata.ancestors.length)
                .withContext(`Expected node with value ${nodeWithMetadata.node.value} to have an ancestors list of length ${valueToDepthMap[nodeWithMetadata.node.value]}, but instead it had a length of ${valueToDepthMap[nodeWithMetadata.node.value]}`)
                .toBe(valueToDepthMap[nodeWithMetadata.node.value]!)
        }
    });

    it("Has the correct ancestors list values", () => {
        for(const nodeWithMetadata of iterable) {
            if (nodeWithMetadata.node === null || nodeWithMetadata.node === undefined) { continue; }

            switch(nodeWithMetadata.node.value) {
                case 10:
                    expect(nodeWithMetadata.ancestors[5]!.value).toBe(9);
                case 9:
                    expect(nodeWithMetadata.ancestors[4]!.value).toBe(8);
                case 8:
                    expect(nodeWithMetadata.ancestors[3]!.value).toBe(7);
                case 7:
                    expect(nodeWithMetadata.ancestors[2]!.value).toBe(6);
                case 6:
                case 5:
                    expect(nodeWithMetadata.ancestors[1]!.value).toBe(2);
                case 2:
                    expect(nodeWithMetadata.ancestors[0]!.value).toBe(0);
                    break;
                case 4:
                case 3:
                    expect(nodeWithMetadata.ancestors[1]!.value).toBe(1);
                case 1:
                    expect(nodeWithMetadata.ancestors[0]!.value).toBe(0);
                    break;
            }
        }
    });
}

function getChildrenOnlyCalledOnce(methodName: string, root: TreeNodeForTesting, iterable: Iterable<NodeWithMetadata<TreeNodeForTesting | null | undefined>>) {
    it("Only calls getChildren() once per node in the tree", () => {
        const resetGetChildrenCounters = function(node: TreeNodeForTesting | null | undefined) {
            if (!node) { return; }
            node.numberOfGetChildrenCalls = 0;
            node.children?.forEach(child => resetGetChildrenCounters(child));
        }
        
        // Reset the counter for the whole tree. We can't guarantee the order of Jasmine's calls, so
        // this makes sure we never get bad data.
        resetGetChildrenCounters(root);
        // Call the loop once to start racking up getChildren() calls
        for (const _ of iterable) {}
        // Check the value in loop #2
        for (const nodeWithMetadata of iterable) {
            if (!nodeWithMetadata.node) { continue; }
            expect(nodeWithMetadata.node.numberOfGetChildrenCalls)
                .withContext(`${methodName} should only call getChildren once per node!`)
                .toBe(methodName === "DFSWithMetadata" ? 1 : 2);
        }
    });
}

function testNodeIterable(methodName: string, root: TreeNodeForTesting, iterable: Iterable<TreeNodeForTesting | null | undefined>, expectedResult: string, checkOneGetChildrenCall: boolean) {
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
        if (!checkOneGetChildrenCall) { return; }

        const resetGetChildrenCounters = function(node: TreeNodeForTesting | null | undefined) {
            if (!node) { return; }
            node.numberOfGetChildrenCalls = 0;
            node.children?.forEach(child => resetGetChildrenCounters(child));
        }
        
        // Reset the counter for the whole tree. We can't guarantee the order of Jasmine's calls, so
        // this makes sure we never get bad data.
        resetGetChildrenCounters(root);
        // call it once to prime all of the counts
        for (const _ of iterable) {}

        let expectedNumberOfCalls: number;
        switch(methodName) {
            case "DFS":
                // This one calls it after we pass the current node, so in a 2nd pass we expect 1.
                expectedNumberOfCalls = 1;
                break;
            case "DFSPostorder":
                // This one calls it before we pass the current node, so in a 2nd pass we expect 2.
                expectedNumberOfCalls = 2;
                break;
            case "BFSFast":
                // This one calls it before we pass the current node, so in a 2nd pass we expect 2.
                expectedNumberOfCalls = 2;
                break;
            default:
                throw new Error("Unexpected value encountered!");
        }
        for (const node of iterable) {
            if (!node) { continue; }
            expect(node.numberOfGetChildrenCalls)
                .withContext(`${methodName} should only call getChildren once per node!`)
                .toBe(expectedNumberOfCalls);
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

function createBinaryTreesForTesting(): BinaryTreeNodeForTesting[] {
    return [
        // Make sure we do the right thing with null/undefined
        BinaryTreeNodeForTesting.createTreeForTesting(null),
        BinaryTreeNodeForTesting.createTreeForTesting(undefined),
    ];
}