import { ExtendedIterable, WrappedIterable, Stack } from "./Collections"
import { MinHeap } from "./Heap";
import { LLNodeIterable, Queue } from "./LinkedList";

export abstract class GraphNode<TNodeInGraph extends GraphNode<TNodeInGraph> | null | undefined> {
    /** 
     * This method should return the adjacent nodes of the current graph node. 
     */
    abstract getAdjacentNodes(): Iterable<TNodeInGraph> | null | undefined;

    /**
     * This method retrieves an iterable that can be used to perform
     * Breadth First (Iterative Deepening) searches of a tree. If
     * performance is a concern, a Breadth First (queue-based) search
     * (referred to as BFSFast in this library) should be preferred.
     * 
     * A Breadth First Search (BFS) is defined as:
     * 
     * A tree traversal that involves breadth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, we scan each level of the tree from left to
     * right before going down to the next level.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type does NOT guarantee that getChildren() will 
     * only be called once per node of the tree.
     * 
     * This traversal type maintains active iterators at all tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public BFSWithMetadata(this: TNodeInGraph): ExtendedIterable<NodeWithMetadata<TNodeInGraph>> {
        return new DepthFirstIterable(this, TraversalType.BreadthFirst, true, (node) => node?.getAdjacentNodes());
    }
    
    /**
     * This method retrieves an iterable that can be used to perform
     * Breadth First (Iterative Deepening) searches of a tree. If
     * performance is a concern, a Breadth First (queue-based) search
     * (referred to as BFSFast in this library) should be preferred.
     * 
     * A Breadth First Search (BFS) is defined as:
     * 
     * A tree traversal that involves breadth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, we scan each level of the tree from left to
     * right before going down to the next level.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type does NOT guarantee that getChildren() will 
     * only be called once per node of the tree.
     * 
     * This traversal type maintains active iterators at all tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public BFS(this: TNodeInGraph): ExtendedIterable<TNodeInGraph> {
        return this?.BFSWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node) ?? 
            ExtendedIterable.empty<TNodeInGraph>();
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Breadth First (Queue-based) searches of a tree. If performance is 
     * not a serious concern, a Breadth First (iterative deepening) search
     * (referred to as BFS in this library) should be preferred to make
     * debugging easier.
     * 
     * A Breadth First Search (BFS) is defined as:
     * 
     * A tree traversal that involves breadth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, we scan each level of the tree from left to
     * right before going down to the next level.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type guarantees that getChildren() will only be called 
     * once per node of the tree.
     * 
     * This traversal type maintains active iterators at several tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public BFSFastWithMetadata(this: TNodeInGraph): ExtendedIterable<NodeWithBackPath<TNodeInGraph>> {
        if (this === null || this === undefined) {
            return ExtendedIterable.empty<NodeWithBackPath<TNodeInGraph>>();
        }
        return new QueueBreadthFirstIterable<TNodeInGraph>(this, true, (node) => node?.getAdjacentNodes());
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Breadth First (Queue-based) searches of a tree. If performance is 
     * not a serious concern, a Breadth First (iterative deepening) search
     * (referred to as BFS in this library) should be preferred to make
     * debugging easier.
     * 
     * A Breadth First Search (BFS) is defined as:
     * 
     * A tree traversal that involves breadth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, we scan each level of the tree from left to
     * right before going down to the next level.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type guarantees that getChildren() will only be called 
     * once per node of the tree.
     * 
     * This traversal type maintains active iterators at several tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public BFSFast(this: TNodeInGraph): ExtendedIterable<TNodeInGraph> {
        return this?.BFSFastWithMetadata()
            .map(nodeWithBackPath => nodeWithBackPath.node) ??
            ExtendedIterable.empty<TNodeInGraph>();
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Depth First Preorder searches of a tree.
     * 
     * A Depth First Preorder search (referred to as DFS) is defined as:
     * 
     * A tree traversal that involves depth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order
     * 0, 1, 3, 4, 2, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, each node will only be traversed before any
     * of its children have been traversed.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type guarantees that getChildren() will only be 
     * called once per node of the tree.
     * 
     * This traversal type maintains active iterators at most tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public DFSWithMetadata(this: TNodeInGraph): ExtendedIterable<NodeWithMetadata<TNodeInGraph>> {
        return new DepthFirstIterable(this, TraversalType.DepthFirstPreorder, true, (node) => node?.getAdjacentNodes());
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Depth First Preorder searches of a tree.
     * 
     * A Depth First Preorder search (referred to as DFS) is defined as:
     * 
     * A tree traversal that involves depth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order
     * 0, 1, 3, 4, 2, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, each node will only be traversed before any
     * of its children have been traversed.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type guarantees that getChildren() will only be 
     * called once per node of the tree.
     * 
     * This traversal type maintains active iterators at most tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public DFS(this: TNodeInGraph): ExtendedIterable<TNodeInGraph> {
        return this?.DFSWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node) ??
            ExtendedIterable.empty<TNodeInGraph>();
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Depth First Postorder searches of a tree.
     * 
     * A Depth First Postorder search (referred to as DFS Postorder) 
     * is defined as:
     * 
     * A tree traversal that involves depth-first searching a tree 
     * from the bottom up. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 3, 4, 1, 5, 10, 9, 8, 7, 6, 2, 0.
     * 
     * In this traversal, each node will only be traversed after all
     * of its children have been traversed.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type guarantees that getChildren() will only be 
     * called once per node of the tree.
     * 
     * This traversal type maintains active iterators at most tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public DFSPostorderWithMetadata(this: TNodeInGraph): ExtendedIterable<NodeWithMetadata<TNodeInGraph>> {
        return new DepthFirstIterable(this, TraversalType.DepthFirstPostorder, true, (node) => node?.getAdjacentNodes());
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Depth First Postorder searches of a tree.
     * 
     * A Depth First Postorder search (referred to as DFS Postorder) 
     * is defined as:
     * 
     * A tree traversal that involves depth-first searching a tree 
     * from the bottom up. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 3, 4, 1, 5, 10, 9, 8, 7, 6, 2, 0.
     * 
     * In this traversal, each node will only be traversed after all
     * of its children have been traversed.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     * 
     * This traversal type guarantees that getChildren() will only be 
     * called once per node of the tree.
     * 
     * This traversal type maintains active iterators at most tree levels.
     * Edits can only be made safely to nodes that are below the current
     * node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public DFSPostorder(this: TNodeInGraph): ExtendedIterable<TNodeInGraph> {
        return this?.DFSPostorderWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node) ??
            ExtendedIterable.empty<TNodeInGraph>();
    }

    /**
     * Performs a Djikstra's algorithm search of the graph. Nodes will be returned out in ascending order of
     * the cost to get to them. For example, if it costs 4 to get to B and 8 to get to C from A, then the nodes
     * will be returned in the order A, B, C.
     * @param costFunction The function that computes the cost to move from the "from" node to the "to" node.
     * @returns An iterable that will return the nodes in the order of a Djikstra's algorithm search.
     */
    public Djikstra(
        this: TNodeInGraph, 
        costFunction: 
        (
            from: NodeWithBackPathWithParent<TNodeInGraph>, 
            to: NodeWithBackPathWithParent<TNodeInGraph>
        ) => number
    ): ExtendedIterable<NodeWithBackPath<TNodeInGraph>> {
        return new DjikstraIterable<TNodeInGraph>(this, costFunction);
    }

    /**
     * Performs an A* algorithm search of the graph. Nodes will be returned out in ascending order of
     * the cost to get to them. For example, if it costs 4 to get to B and 8 to get to C from A, then the nodes
     * will be returned in the order A, B, C.
     * @param costFunction The function that computes the cost to move from the "from" node to the "to" node.
     * @param heuristicFunction A function that computes the heuristic cost to move from the "from" node to the "to" node
     * @returns An iterable that will return the nodes in the order of an A* algorithm search.
     */
    public AStar(
        this: TNodeInGraph, 
        costFunction: 
        (
            from: NodeWithBackPathWithParent<TNodeInGraph>, 
            to: NodeWithBackPathWithParent<TNodeInGraph>
        ) => number, 
        heuristicFunction: 
        (
            from: NodeWithBackPathWithParent<TNodeInGraph>, 
            to: NodeWithBackPathWithParent<TNodeInGraph>
        ) => number
    ): ExtendedIterable<NodeWithBackPath<TNodeInGraph>> {
        return new AStarIterable(this, costFunction, heuristicFunction);
    }
}

export enum TraversalType {
    /**
     * A tree traversal that involves depth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order
     * 0, 1, 3, 4, 2, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, each node will only be traversed before any
     * of its children have been traversed.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     */
    DepthFirstPreorder,

    /**
     * A tree traversal that involves depth-first searching a tree 
     * from the bottom up. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 3, 4, 1, 5, 10, 9, 8, 7, 6, 2, 0.
     * 
     * In this traversal, each node will only be traversed after all
     * of its children have been traversed.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     */
    DepthFirstPostorder,

    /**
     * A tree traversal that involves depth-first searching a tree 
     * from the left to the right. Because of the left-right 
     * directionality involved in an in-order traversal it can only
     * be performed on binary trees. 
     * 
     * Given a tree of the following shape where "/" represents a 
     * "left" relationship and "\\" represents a "right" relationship, 
     * this traversal type would traverse the elements in the order 
     * 3, 1, 4, 0, 5, 2, 7, 9, 10, 8, 6
     * 
     * In this traversal, each node will only be traversed after all
     * of its children have been traversed.
     * 
     * You can think of vertically equal nodes as being traversed top
     * to bottom if they are "left" of their parent as is the case with 
     * 2, 7, and 9 or bottom to top if they are "right" of their parent
     * as is the case with 6, 8, and 10.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     */
    DepthFirstInOrder,

    /**
     * A tree traversal that involves breadth-first searching a tree 
     * from the top down. Given a tree of the following shape, this 
     * traversal type would traverse the elements in the order 
     * 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
     * 
     * In this traversal, we scan each level of the tree from left to
     * right before going down to the next level.
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7
     * -           \
     * -            8
     * -           /
     * -          9
     * -           \
     * -           10
     */
    BreadthFirst,
}

/** 
 * A wrapper class for a tree node to contain the node itself along with
 * metadata about its position in the tree.
 */
export class NodeWithMetadata<T> {
    /**
     * The current tree node itself.
     */
    public node: T;

    /**
     * The ancestors of the current tree node.
     * These will be in order from the root node (at index 0) down to the 
     * parent of the current node (at index length - 1)
     * In the following tree, the ancestors at node 10 would look like:
     * [0, 2, 6, 7, 8, 9]
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7         
     * -           \
     * -            8       
     * -           /
     * -          9         
     * -           \
     * -           10       
     */
    public ancestors: readonly T[];

    /**
     * The parent of the current node in the tree.
     * In the following tree, the parent of node 6 is node 2
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7         
     * -           \
     * -            8       
     * -           /
     * -          9         
     * -           \
     * -           10       
     */
    public get parent(): T | undefined {
        if (this.ancestors.length === 0) { return undefined; }
        return this.ancestors[this.ancestors.length - 1];
    }

    /**
     * The depth of the current node in the tree. This is defined as:
     * root depth = 0, increasing by 1 for each level of the tree down
     * the node is.
     * In the following tree, the nodes have the following depths:
     * -        0           depth: 0
     * -       / \          
     * -      1   2         depth: 1
     * -     / \ / \        
     * -    3  4 5  6       depth: 2
     * -           /
     * -          7         depth: 3
     * -           \
     * -            8       depth: 4
     * -           /
     * -          9         depth: 5
     * -           \
     * -           10       depth: 6
     */
    public get depth(): number {
        return this.ancestors.length;
    }

    public constructor(node: T, ancestors?: readonly T[]) {
        this.node = node;
        this.ancestors = ancestors ?? [];
    }
}

export type NodeWithBackPathWithParent<T> = NodeWithBackPath<T> & { parent: T };

/** 
 * A wrapper class for a tree node to contain the node itself along with
 * metadata about its position in the tree.
 */
export class NodeWithBackPath<T> {
    /**
     * The current tree node itself.
     */
    public node: T;

    /**
     * The ancestors of the current tree node.
     * These will be in order from the parent of the current node (at element 0) up to the 
     * root node (at the last element). This is a linked list, so getting the root node is
     * O(depth).
     * 
     * In the following tree, the ancestors at node 10 would look like:
     * 9 -> 8 -> 7 -> 6 -> 2 -> 0
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7         
     * -           \
     * -            8       
     * -           /
     * -          9         
     * -           \
     * -           10       
     */
    public get ancestors(): ExtendedIterable<T> {
        return new LLNodeIterable<NodeWithBackPath<T>>(this, nodeWithBackPath => nodeWithBackPath.parent)
            .skip(1)
            .map(nodeWithBackPath => nodeWithBackPath.node);
    }
    
    /**
     * The parent of the current node in the tree.
     * In the following tree, the parent of node 6 is node 2
     * -        0
     * -       / \
     * -      1   2
     * -     / \ / \
     * -    3  4 5  6
     * -           /
     * -          7         
     * -           \
     * -            8       
     * -           /
     * -          9         
     * -           \
     * -           10       
     */
    public get parent() {
        return this._parent;
    }

    private _parent: NodeWithBackPath<T> | undefined;

    constructor(node: T, parent: NodeWithBackPath<T> | undefined) {
        this.node = node;
        this._parent = parent;
    }
}

export class DepthFirstIterable<TNodeInGraph> extends ExtendedIterable<NodeWithMetadata<TNodeInGraph>> {
    private _traversalRoot: TNodeInGraph;
    private _traversalType: TraversalType;
    private _checkForCircularReferences: boolean;
    private _getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined;

    constructor(root: TNodeInGraph, traversalType: TraversalType, checkForCircularReferences: boolean, getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined) {
        super();
        this._traversalRoot = root;
        this._traversalType = traversalType;
        this._getConnections = getConnections;
        this._checkForCircularReferences = checkForCircularReferences;
        if (this._enableDebugging) this._asArray = this.toArray();
    }

    [Symbol.iterator](): Iterator<NodeWithMetadata<TNodeInGraph>> {
        switch(this._traversalType) {
            case TraversalType.DepthFirstPreorder:
                return new DepthFirstPreorderIterator(this._traversalRoot, this._checkForCircularReferences, this._getConnections);
            case TraversalType.DepthFirstPostorder:
                return new DepthFirstPostorderIterator(this._traversalRoot, this._checkForCircularReferences, this._getConnections);
            case TraversalType.BreadthFirst:
                return new IterativeDeepeningBreadthFirstIterator(this._traversalRoot, this._checkForCircularReferences, this._getConnections);
            default:
                throw new Error("Not implemented");
        }
    }
}

abstract class DepthFirstIterator<TNodeInGraph> implements Iterator<NodeWithMetadata<TNodeInGraph>> {
    protected _finished: boolean = false;
    protected get traversalRoot(): TNodeInGraph | undefined {
        return this._traversalRoot;
    }
    private _traversalRoot: TNodeInGraph | undefined;
    private _traversalStack: Stack<Iterator<TNodeInGraph>> = new Stack<Iterator<TNodeInGraph>>();
    protected get ancestors(): readonly TNodeInGraph[] {
        return this._ancestors;
    }
    private _ancestors: TNodeInGraph[] = [];
    private _currenTNodeInGraphForEachIterator: Stack<TNodeInGraph> = new Stack<TNodeInGraph>();
    protected get currentNode(): TNodeInGraph | undefined {
        return this._currenTNodeInGraphForEachIterator.peek();
    }

    protected _visitedNodes: Set<TNodeInGraph> = new Set<TNodeInGraph>();

    protected getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined;

    constructor(root: TNodeInGraph | undefined, checkForCirularReferences: boolean, getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined) {
        this._traversalRoot = root;

        if (checkForCirularReferences) {
            this.getConnections = function(this: DepthFirstIterator<TNodeInGraph>, getConnectionsOG: (node:TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined, node: TNodeInGraph): Iterable<TNodeInGraph> | null | undefined {
                this._visitedNodes.add(node);
                let connections = getConnectionsOG(node);
                if (!connections) { return connections; }
                return new WrappedIterable(connections).filter(function(this: DepthFirstIterator<TNodeInGraph>, connection: TNodeInGraph) { 
                    let result = !this._visitedNodes.has(connection);
                    if (!result) {
                        this._visitedNodes.add(connection);
                    }
                    return result;
                }.bind(this));
            }.bind(this, getConnections);
        }
        else {
            this.getConnections = getConnections;
        }
    }

    abstract next(): IteratorResult<NodeWithMetadata<TNodeInGraph>, undefined>;

    public reset() {
        this._finished = false;
        this._traversalStack.clear();
        this._ancestors = [];
        this._currenTNodeInGraphForEachIterator.clear();
        this._visitedNodes.clear();
    }

    protected _tryToPushIterator(): boolean {
        if (this._traversalStack.length === 0) {
            if (this._traversalRoot === undefined) { return false; }
            this._traversalStack.push(
                [this._traversalRoot][Symbol.iterator]()
            );
            return true;
        }

        let currentNode = this._currenTNodeInGraphForEachIterator.peek();
        let newTreeLevel: Iterable<TNodeInGraph> | null | undefined = undefined;
        if (currentNode === undefined || currentNode === null) { return false; }
        newTreeLevel = this.getConnections(currentNode);
        if (newTreeLevel === undefined || newTreeLevel === null) { return false; }
        const newIter = newTreeLevel[Symbol.iterator]();
        this._traversalStack.push(newIter);
        return true;
    }

    protected _popEmptyIteratorsUntilWeMove() {
        while (this._topIteratorIsEmpty()) {
            this._popTopIterator();
        }
    }

    protected _topIteratorIsEmpty(): boolean {
        // Empty stack means that there is no top iterator, so it can't be empty.
        // Calling code relies on this behavior.
        if (this._traversalStack.length < 1) { return false; }
        const iterResult = this._traversalStack.peek()!.next();
        if (iterResult.done) { return true; }

        if (this._currenTNodeInGraphForEachIterator.length === this._traversalStack.length) {
            this._currenTNodeInGraphForEachIterator.pop();
            this._ancestors.pop();
        }

        const topNodeOf_currenTNodeInGraphForEachIterator = this._currenTNodeInGraphForEachIterator.peek();
        if (topNodeOf_currenTNodeInGraphForEachIterator !== undefined) {
            this._ancestors.push(topNodeOf_currenTNodeInGraphForEachIterator);
        }
        
        this._currenTNodeInGraphForEachIterator.push(iterResult.value);
        return false;
    }

    protected _popTopIterator() {
        if (this._currenTNodeInGraphForEachIterator.length === this._traversalStack.length) {
            this._currenTNodeInGraphForEachIterator.pop();
            this._ancestors.pop();
        }
        this._traversalStack.pop();
    }

    protected _stackIsEmpty(): boolean {
        return this._traversalStack.length === 0;
    }
}

class DepthFirstPreorderIterator<TNodeInGraph> extends DepthFirstIterator<TNodeInGraph> {
    public maxDepth: number = Number.MAX_VALUE;

    public next(): IteratorResult<NodeWithMetadata<TNodeInGraph>, undefined> {
        if ((this.maxDepth === 0 && this._stackIsEmpty()) || this.ancestors.length < this.maxDepth) {
            this._tryToPushIterator();
        }
        this._popEmptyIteratorsUntilWeMove();

        if (this._stackIsEmpty()) {
            this._finished = true;
        }
        
        if (this._finished) {
            return {
                done: true, 
                value: undefined
            };
        }
        return {
            done: false, 
            value: new NodeWithMetadata(this.currentNode!, this.ancestors)
        };
    }
}

class DepthFirstPostorderIterator<TNodeInGraph> extends DepthFirstIterator<TNodeInGraph> {
    public next(): IteratorResult<NodeWithMetadata<TNodeInGraph>, undefined> {
        if (this._finished) { return { done: true, value: undefined }; }

        // If we have an iterator on the stack, see if it's empty. If it is,
        // only pop once before returning.
        if (this._topIteratorIsEmpty()) {
            this._popTopIterator();
            return this._getAppropriateReturnResult();
        }

        // Either we don't have an iterator on the stack or it wasn't empty
        // We need to descend its subtree in a while loop
        while (this._tryToPushIterator()) {
            if (this._topIteratorIsEmpty()) {
                this._popTopIterator();
                break;
            }
        }

        // Figure out our finished flag and root/non-root node handling.
        return this._getAppropriateReturnResult();
    }

    /**
     * This method handles setting the _finished flag and gets the IteratorResult.
     * @returns The IteratorResult object
     */
    private _getAppropriateReturnResult(): IteratorResult<NodeWithMetadata<TNodeInGraph>, undefined> {
        if (this.currentNode === this.traversalRoot) {
            // The root is the last node in a Postorder search, so we're done!
            this._finished = true;
        }

        return {
            done: false,
            value: new NodeWithMetadata(this.currentNode!, this.ancestors)
        };
    }
}

class IterativeDeepeningBreadthFirstIterator<TNodeInGraph> implements Iterator<NodeWithMetadata<TNodeInGraph>, undefined> {
    private _DFSIterator: DepthFirstPreorderIterator<TNodeInGraph>;
    private _currentDepth: number = 0;
    private _hasMoreNodes: boolean = true;
    private _visitedNodes: Set<TNodeInGraph> = new Set<TNodeInGraph>();

    constructor(traversalRoot: TNodeInGraph, checkForCircularReferences: boolean, getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined) {
        this._DFSIterator = new DepthFirstPreorderIterator(traversalRoot, checkForCircularReferences, getConnections);
        this._DFSIterator.maxDepth = this._currentDepth;
    }

    public next(): IteratorResult<NodeWithMetadata<TNodeInGraph>, undefined> {
        while(this._hasMoreNodes) {
            do {
                let iterResult = this._DFSIterator.next();
                if (iterResult.done) { 
                    if (!this._hasMoreNodes) { break; }
                    this._increaseDepth();
                    continue;
                }
    
                if (iterResult.value.depth < this._currentDepth) { continue; }
                if (this._visitedNodes.has(iterResult.value.node)) { continue; }
                this._visitedNodes.add(iterResult.value.node);
                this._hasMoreNodes = true;
                return iterResult;
            } while(true)
        }
        return { done: true, value: undefined };
    }

    private _increaseDepth() {
        this._currentDepth++;
        this._DFSIterator.maxDepth = this._currentDepth;
        this._DFSIterator.reset();
        this._hasMoreNodes = false;
    }
}

export class QueueBreadthFirstIterable<TNodeInGraph> extends ExtendedIterable<NodeWithBackPath<TNodeInGraph>> {
    private _traversalRoot: TNodeInGraph;
    private _checkForCircularReferences: boolean;
    private _getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined;
    constructor(traversalRoot: TNodeInGraph, checkForCircularReferences: boolean, getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined) {
        super();
        this._traversalRoot = traversalRoot;
        this._checkForCircularReferences  = checkForCircularReferences;
        this._getConnections = getConnections;
    }

    [Symbol.iterator]() {
        return new QueueBreadthFirstIterator(this._traversalRoot, this._checkForCircularReferences, this._getConnections);
    }
}

class QueueBreadthFirstIterator<TNodeInGraph> implements Iterator<NodeWithBackPath<TNodeInGraph>> {
    private _traveralQueue: Queue<Iterator<NodeWithBackPath<TNodeInGraph>, undefined>> = new Queue<Iterator<NodeWithBackPath<TNodeInGraph>, undefined>>();
    private _visitedNodes: Set<TNodeInGraph> = new Set<TNodeInGraph>();
    private _getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined;
    
    constructor(traversalRoot: TNodeInGraph, checkForCircularReferences: boolean, getConnections: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined) {
        const rootIter = {
            done: false,  
            next: function(this: { done: boolean }) { 
                if (this.done) {
                    return { done: true, value: undefined };
                }
                this.done = true;
                return { done: false, value: new NodeWithBackPath(traversalRoot, undefined) };
            } 
        } as Iterator<NodeWithBackPath<TNodeInGraph>, undefined>;

        if (checkForCircularReferences) {
            this._getConnections = function(this: QueueBreadthFirstIterator<TNodeInGraph>, getConnectionsOG: (node: TNodeInGraph) => Iterable<TNodeInGraph> | null | undefined, node: TNodeInGraph): Iterable<TNodeInGraph> | null | undefined {
                let children = getConnectionsOG(node);
                if (!children) { return children; }
                return new WrappedIterable(children).filter(function(this: QueueBreadthFirstIterator<TNodeInGraph>, child: TNodeInGraph) { 
                    let result = !this._visitedNodes.has(child); 
                    if (result) {
                        this._visitedNodes.add(node);
                    }
                    return result;
                }.bind(this));
            }.bind(this, getConnections);
        }
        else {
            this._getConnections = getConnections;
        }
        this._traveralQueue.enqueue(rootIter);
    }

    public next(): IteratorResult<NodeWithBackPath<TNodeInGraph>, undefined> {
        let iterResult = this._traveralQueue.peek()?.next();
        
        while (iterResult === undefined || iterResult.done) {
            this._traveralQueue.dequeue();
            
            if (this._traveralQueue.peek() === undefined) {
                return { done: true, value: undefined };
            }

            iterResult = this._traveralQueue.peek()?.next();
        }

        this._visitedNodes.add(iterResult.value.node);
        let children: Iterable<TNodeInGraph> | null | undefined = undefined;
        if (iterResult.value?.node !== null && iterResult.value.node !== undefined) {
            children = this._getConnections(iterResult.value.node);
        }
        if (children !== null && children !== undefined) { 
            this._traveralQueue.enqueue(
                new WrappedIterable(children)
                    .map<NodeWithBackPath<TNodeInGraph>>(
                        function(this: NodeWithBackPath<TNodeInGraph>, child: TNodeInGraph): NodeWithBackPath<TNodeInGraph> { 
                            return new NodeWithBackPath(child, this);
                        // Make sure to bind the value! 
                        // This is evaluated lazily, so its context may be gone when we try to access it!
                        }.bind(iterResult.value) 
                    )[Symbol.iterator]());
        }

        return { done: false, value: iterResult.value };
    }
}

type CostFunction<T> = (from: NodeWithBackPathWithParent<T>, to: NodeWithBackPathWithParent<T>) => number;

class DjikstraIterable<TNodeInGraph extends GraphNode<TNodeInGraph> | null | undefined> extends ExtendedIterable<NodeWithBackPath<TNodeInGraph>> {
    private _root: TNodeInGraph;
    private _costFunction: (from: NodeWithBackPathWithParent<TNodeInGraph>, to: NodeWithBackPathWithParent<TNodeInGraph>) => number;

    constructor(root: TNodeInGraph, costFunction: CostFunction<TNodeInGraph>) {
        super();
        this._root = root;
        this._costFunction = costFunction;
    }

    [Symbol.iterator](): Iterator<NodeWithBackPath<TNodeInGraph>, undefined> {
        return new DjikstraIterator(this._root, this._costFunction); 
    }
}

type DjikstraHeapNode<TNodeInGraph> = {
    totalCost: number;
    graphNodeWithBackPath: NodeWithBackPath<TNodeInGraph>;
}

class DjikstraIterator<TNodeInGraph extends GraphNode<TNodeInGraph> | null | undefined> implements Iterator<NodeWithBackPath<TNodeInGraph>, undefined> {
    private _costFunction: CostFunction<TNodeInGraph>;
    private _traversalHeap: MinHeap<DjikstraHeapNode<TNodeInGraph>>;
    private _visitedNodes: Set<TNodeInGraph> = new Set();

    constructor(root: TNodeInGraph, costFunction: CostFunction<TNodeInGraph>) {
        this._costFunction = costFunction;
        this._traversalHeap = new MinHeap<DjikstraHeapNode<TNodeInGraph>>((a, b) => a.totalCost - b.totalCost);
        this._traversalHeap.push({ 
            totalCost: 0, 
            graphNodeWithBackPath: new NodeWithBackPath(root, undefined) 
        });
    }

    public next(): IteratorResult<NodeWithBackPath<TNodeInGraph>, undefined> {
        let djikstraHeapNode = this._traversalHeap.pop();
        while (djikstraHeapNode && this._visitedNodes.has(djikstraHeapNode.graphNodeWithBackPath.node)) {
            djikstraHeapNode = this._traversalHeap.pop();
        }
        if (djikstraHeapNode === undefined) {
            return { done: true, value: undefined };
        }

        if (djikstraHeapNode.graphNodeWithBackPath.node) {
            this._visitedNodes.add(djikstraHeapNode.graphNodeWithBackPath.node);
            const adjacents = djikstraHeapNode.graphNodeWithBackPath.node.getAdjacentNodes();
            if (adjacents) { 
                const adjacentsToUse = new WrappedIterable(adjacents).filter(node => !this._visitedNodes.has(node));
                for (const adjacent of adjacentsToUse) {
                    let currentNodeWithBackPath = djikstraHeapNode.graphNodeWithBackPath;
                    this._traversalHeap.push({
                        totalCost: djikstraHeapNode.totalCost + this._costFunction(
                            currentNodeWithBackPath as NodeWithBackPathWithParent<TNodeInGraph>, 
                            new NodeWithBackPath(adjacent, currentNodeWithBackPath) as NodeWithBackPathWithParent<TNodeInGraph>
                        ), 
                        graphNodeWithBackPath: new NodeWithBackPath(adjacent, currentNodeWithBackPath)
                    });
                }
            }
        }

        return { done: false, value: djikstraHeapNode.graphNodeWithBackPath };
    }
}

class AStarIterable<TNodeInGraph extends GraphNode<TNodeInGraph> | null | undefined> extends ExtendedIterable<NodeWithBackPath<TNodeInGraph>> {
    private _root: TNodeInGraph;
    private _costFunction: CostFunction<TNodeInGraph>;

    constructor(
        root: TNodeInGraph, 
        costFunction: CostFunction<TNodeInGraph>, 
        heuristicFunction: CostFunction<TNodeInGraph>
    ) {
        super();
        this._root = root;
        this._costFunction = function(costFunction: CostFunction<TNodeInGraph>, heuristicFunction: CostFunction<TNodeInGraph>, from: NodeWithBackPathWithParent<TNodeInGraph>, to: NodeWithBackPathWithParent<TNodeInGraph>) { 
            return costFunction(from, to) + heuristicFunction(from, to); 
        }.bind(undefined, costFunction, heuristicFunction);
    }

    [Symbol.iterator](): Iterator<NodeWithBackPath<TNodeInGraph>, undefined> {
        return new DjikstraIterator(this._root, this._costFunction); 
    }
}