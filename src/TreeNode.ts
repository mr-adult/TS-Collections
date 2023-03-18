import { Stack } from "./Collections"
import { Queue } from "./LinkedList";

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
    DepthFirstSInOrder,

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
 * An extensible class that defines methods for traversing the tree.
 * 
 * The following iterators are recommended for different applications:
 * For tree pruning, a DFS Preorder or BFS search is recommended. A 
 * DFS Postorder search will create unnecessary performance cost.
 * 
 * For tree flattening operations (pulling lower nodes up to higher levels
 * of the tree), a DFS Postorder search is recommended.
 */
export abstract class TreeNode<TNodeInTree extends TreeNode<TNodeInTree>> {
    /** 
     * This method should return the children of the current tree node. 
     * It is assumed that a tree contains no circular references.
     */
    abstract getChildren(): Iterable<TNodeInTree> | null | undefined;

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
    public BFSWithMetadata(this: TNodeInTree): Iterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstIterable(this, TraversalType.BreadthFirst);
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
    public BFSFast(this: TNodeInTree): Iterable<TNodeInTree> {
        return new QueueBreadthFirstIterable(this);
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
    public DFSWithMetadata(this: TNodeInTree): Iterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstIterable(this, TraversalType.DepthFirstPreorder);
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
    public DFSPostorderWithMetadata(this: TNodeInTree): Iterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstIterable(this, TraversalType.DepthFirstPostorder);
    }
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
    public ancestors: Iterable<T>;
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

    private _parent: NodeWithBackPath<T>;

    constructor(node: T, parent: NodeWithBackPath<T>) {
        this.node = node;
        this._parent = parent;
    }
}

class DepthFirstIterable<TNodeInTree extends TreeNode<TNodeInTree>> implements Iterable<NodeWithMetadata<TNodeInTree>> {
    private _traversalRoot: TNodeInTree | undefined;
    private _traversalType: TraversalType;

    constructor(root: TNodeInTree | undefined | null, traversalType: TraversalType) {
        this._traversalRoot = root;
        this._traversalType = traversalType;
    }

    [Symbol.iterator](): Iterator<NodeWithMetadata<TNodeInTree>> {
        switch(this._traversalType) {
            case TraversalType.DepthFirstPreorder:
                return new DepthFirstPreorderIterator(this._traversalRoot);
            case TraversalType.DepthFirstPostorder:
                return new DepthFirstPostorderIterator(this._traversalRoot);
            case TraversalType.BreadthFirst:
                return new IterativeDeepeningBreadthFirstIterator(this._traversalRoot);
            default:
                throw new Error("Not implemented");
        }
    }
}

abstract class DepthFirstIterator<TNodeInTree extends TreeNode<TNodeInTree>> implements Iterator<NodeWithMetadata<TNodeInTree>> {
    protected _finished: boolean = false;
    protected get traversalRoot(): TNodeInTree | undefined {
        return this._traversalRoot;
    }
    private _traversalRoot: TNodeInTree | undefined;
    private _traversalStack: Stack<Iterator<TNodeInTree>> = new Stack<Iterator<TNodeInTree>>();
    protected get ancestors(): readonly TNodeInTree[] {
        return this._ancestors;
    }
    private _ancestors: TNodeInTree[] = [];
    private _currenTNodeInTreeForEachIterator: Stack<TNodeInTree> = new Stack<TNodeInTree>();
    protected get currentNode(): TNodeInTree {
        return this._currenTNodeInTreeForEachIterator.peek();
    }

    constructor(root: TNodeInTree | undefined) {
        this._traversalRoot = root;
    }

    abstract next(): IteratorResult<NodeWithMetadata<TNodeInTree>, undefined>;

    public reset() {
        this._finished = false;
        this._traversalStack.clear();
        this._ancestors = [];
        this._currenTNodeInTreeForEachIterator.clear();
    }

    protected _tryToPushIterator(): boolean {
        if (this._traversalStack.length === 0) {
            if (this._traversalRoot === undefined) { return false; }
            this._traversalStack.push(
                [this._traversalRoot][Symbol.iterator]()
            );
            return true;
        }

        const newTreeLevel = this._currenTNodeInTreeForEachIterator.peek()?.getChildren();
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
        const iterResult = this._traversalStack.peek().next();
        if (iterResult.done) { return true; }

        if (this._currenTNodeInTreeForEachIterator.length === this._traversalStack.length) {
            this._currenTNodeInTreeForEachIterator.pop();
            this._ancestors.pop();
        }

        const topNodeOf_currenTNodeInTreeForEachIterator = this._currenTNodeInTreeForEachIterator.peek();
        if (topNodeOf_currenTNodeInTreeForEachIterator !== undefined) {
            this._ancestors.push(topNodeOf_currenTNodeInTreeForEachIterator);
        }
        
        this._currenTNodeInTreeForEachIterator.push(iterResult.value);
        return false;
    }

    protected _popTopIterator() {
        if (this._currenTNodeInTreeForEachIterator.length === this._traversalStack.length) {
            this._currenTNodeInTreeForEachIterator.pop();
            this._ancestors.pop();
        }
        this._traversalStack.pop();
    }

    protected _stackIsEmpty(): boolean {
        return this._traversalStack.length === 0;
    }
}

class DepthFirstPreorderIterator<TNodeInTree extends TreeNode<TNodeInTree>> extends DepthFirstIterator<TNodeInTree> {
    public maxDepth: number = Number.MAX_VALUE;

    public next(): IteratorResult<NodeWithMetadata<TNodeInTree>, undefined> {
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
            value: new NodeWithMetadata(this.currentNode, this.ancestors)
        };
    }
}

class DepthFirstPostorderIterator<TNodeInTree extends TreeNode<TNodeInTree>> extends DepthFirstIterator<TNodeInTree> {
    public next(): IteratorResult<NodeWithMetadata<TNodeInTree>, undefined> {
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
    private _getAppropriateReturnResult(): IteratorResult<NodeWithMetadata<TNodeInTree>, undefined> {
        if (this.currentNode === this.traversalRoot) {
            // The root is the last node in a Postorder search, so we're done!
            this._finished = true;
        }

        return {
            done: false,
            value: new NodeWithMetadata(this.currentNode, this.ancestors)
        };
    }
}

class IterativeDeepeningBreadthFirstIterator<TNodeInTree extends TreeNode<TNodeInTree>> implements Iterator<NodeWithMetadata<TNodeInTree>, undefined> {
    private _DFSIterator: DepthFirstPreorderIterator<TNodeInTree>;
    private _currentDepth: number = 0;
    private _hasMoreNodes: boolean = true;

    constructor(traversalRoot: TNodeInTree) {
        this._DFSIterator = new DepthFirstPreorderIterator(traversalRoot);
        this._DFSIterator.maxDepth = this._currentDepth;
    }

    public next(): IteratorResult<NodeWithMetadata<TNodeInTree>, undefined> {
        while(this._hasMoreNodes) {
            do {
                let iterResult = this._DFSIterator.next();
                if (iterResult.done) { 
                    if (!this._hasMoreNodes) { break; }
                    this._increaseDepth();
                    continue;
                }
    
                if (iterResult.value.depth < this._currentDepth) { continue; }
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

class QueueBreadthFirstIterable<TNodeInTree extends TreeNode<TNodeInTree>> implements Iterable<TNodeInTree> {
    private _traversalRoot: TNodeInTree;
    constructor(traversalRoot: TNodeInTree) {
        this._traversalRoot = traversalRoot;
    }

    [Symbol.iterator]() {
        return new QueueBreadthFirstIterator(this._traversalRoot);
    }
}

class QueueBreadthFirstIterator<TNodeInTree extends TreeNode<TNodeInTree>> implements Iterator<TNodeInTree> {
    private _traveralQueue: Queue<Iterator<TNodeInTree>> = new Queue<Iterator<TNodeInTree>>();
    
    constructor(traversalRoot: TNodeInTree) {
        const rootIter = {
            done: false,  
            next: function() { 
                if (this.done) {
                    return { done: true, value: undefined };
                }
                this.done = true;
                return { done: false, value: traversalRoot };
            } 
        };

        this._traveralQueue.enqueue(rootIter);
    }

    public next(): IteratorResult<TNodeInTree> {
        let iterResult = this._traveralQueue.peek().next();
        
        while (iterResult === undefined || iterResult.done) {
            this._traveralQueue.dequeue();
            
            if (this._traveralQueue.peek() === undefined) {
                return { done: true, value: undefined };
            }

            iterResult = this._traveralQueue.peek().next();
        }

        const children = iterResult.value?.getChildren();
        if (children !== null && children !== undefined) { 
            this._traveralQueue.enqueue(children[Symbol.iterator]());
        }

        return { done: false, value: iterResult.value };
    }
}