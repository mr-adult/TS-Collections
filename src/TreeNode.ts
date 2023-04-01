import { ExtendedIterable, Stack } from "./Collections";
import { TraversalType, NodeWithBackPath, NodeWithMetadata, DepthFirstIterable, QueueBreadthFirstIterable } from "./GraphNode";

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
export abstract class TreeNode<TNodeInTree extends TreeNode<TNodeInTree> | null | undefined> {
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
    public BFSWithMetadata(this: TNodeInTree): ExtendedIterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstIterable(this, TraversalType.BreadthFirst, false, (node) => node?.getChildren());
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
    public BFS(this: TNodeInTree): ExtendedIterable<TNodeInTree> {
        return this?.BFSWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node) ?? 
            ExtendedIterable.empty<TNodeInTree>();
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
    public BFSFastWithMetadata(this: TNodeInTree): ExtendedIterable<NodeWithBackPath<TNodeInTree>> {
        if (this === null || this === undefined) {
            return ExtendedIterable.empty<NodeWithBackPath<TNodeInTree>>();
        }
        return new QueueBreadthFirstIterable<TNodeInTree>(this, false, (node) => node?.getChildren());
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
    public BFSFast(this: TNodeInTree): ExtendedIterable<TNodeInTree> {
        return this?.BFSFastWithMetadata()
            .map(nodeWithBackPath => nodeWithBackPath.node) ??
            ExtendedIterable.empty<TNodeInTree>();
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
    public DFSWithMetadata(this: TNodeInTree): ExtendedIterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstIterable(this, TraversalType.DepthFirstPreorder, false, (node) => node?.getChildren());
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
    public DFS(this: TNodeInTree): ExtendedIterable<TNodeInTree> {
        return this?.DFSWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node) ??
            ExtendedIterable.empty<TNodeInTree>();
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
    public DFSPostorderWithMetadata(this: TNodeInTree): ExtendedIterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstIterable(this, TraversalType.DepthFirstPostorder, false, (node) => node?.getChildren());
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
    public DFSPostorder(this: TNodeInTree): ExtendedIterable<TNodeInTree> {
        return this?.DFSPostorderWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node) ??
            ExtendedIterable.empty<TNodeInTree>();
    }
}

/**
 * An extensible class that defines methods for traversing the tree.
 * 
 * The following iterators are recommended for different applications:
 * 
 * For tree pruning, a DFS Preorder or BFS search is recommended. A 
 * DFS Postorder search will create unnecessary performance cost.
 * 
 * For tree flattening operations (pulling lower nodes up to higher levels
 * of the tree), a DFS Postorder search is recommended.
 * 
 * For sorting, a DFS In Order Traversal is recommended.
 */
export abstract class BinaryTreeNode<TNodeInTree extends BinaryTreeNode<TNodeInTree> | null | undefined> extends TreeNode<TNodeInTree> {
    /** 
     * This method should return the left of the current tree node. 
     * It is assumed that a tree contains no circular references.
     */
    public abstract getLeft(): TNodeInTree | null | undefined;

    /** 
     * This method should return the right of the current tree node. 
     * It is assumed that a tree contains no circular references.
     */
    public abstract getRight(): TNodeInTree | null | undefined;

    // Inheriting documentation from TreeNode class
    public getChildren(): Iterable<TNodeInTree> | null | undefined {
        return [this.getLeft(), this.getRight()]
            .filter(
                value => value !== null && 
                value !== undefined
            ) as Iterable<TNodeInTree>;
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Depth First In Order searches of a tree.
     * 
     * A Depth First In Order search (referred to as DFS In Order) 
     * is defined as:
     * 
     * A tree traversal that involves depth-first searching a tree 
     * from the left to the right. Given a tree of the following shape, 
     * this traversal type would traverse the elements in the order 
     * 3, 1, 4, 0, 5, 2, 7, 9, 10, 8, 6.
     * 
     * In this traversal, each node will be traversed after its left,
     * but before its right.
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
     * This traversal type guarantees that getLeft() and getRight will each
     * only be called once per node of the tree.
     * 
     * This traversal type maintains a stack of ancestors of the current node
     * during traversal. Edits can only be made safely to nodes that are below 
     * the current node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public DFSInOrderWithMetadata(this: TNodeInTree): ExtendedIterable<NodeWithMetadata<TNodeInTree>> {
        return new DepthFirstInOrderIterable(this);
    }

    /**
     * This method retrieves an iterable that can be used to perform
     * Depth First In Order searches of a tree.
     * 
     * A Depth First In Order search (referred to as DFS In Order) 
     * is defined as:
     * 
     * A tree traversal that involves depth-first searching a tree 
     * from the left to the right. Given a tree of the following shape, 
     * this traversal type would traverse the elements in the order 
     * 3, 1, 4, 0, 5, 2, 7, 9, 10, 8, 6.
     * 
     * In this traversal, each node will be traversed after its left,
     * but before its right.
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
     * This traversal type guarantees that getLeft() and getRight will each
     * only be called once per node of the tree.
     * 
     * This traversal type maintains a stack of ancestors of the current node
     * during traversal. Edits can only be made safely to nodes that are below 
     * the current node in the tree. 
     * 
     * For example, if I need to remove node 8 from the
     * example tree, I would need to do so when 7 is the current node.
     * Removing it when 8, 9, or 10 are the current node would be unsafe.
     */
    public DFSInOrder(this: TNodeInTree): ExtendedIterable<TNodeInTree> {
        if (!this) { return ExtendedIterable.empty<TNodeInTree>(); }
        return this.DFSInOrderWithMetadata()
            .map(nodeWithMetadata => nodeWithMetadata.node);
    }
}

class DepthFirstInOrderIterable<TNodeInTree extends BinaryTreeNode<TNodeInTree> | null | undefined> extends ExtendedIterable<NodeWithMetadata<TNodeInTree>> {
    private _traversalRoot: TNodeInTree;
    constructor(traversalRoot: TNodeInTree) {
        super();
        this._traversalRoot = traversalRoot;
    }
    [Symbol.iterator](): Iterator<NodeWithMetadata<TNodeInTree>> {
        if (!this._traversalRoot) return ExtendedIterable.empty<NodeWithMetadata<TNodeInTree>>()[Symbol.iterator]();
        return new DepthFirstInOrderIterator<TNodeInTree>(this._traversalRoot);
    }
}

class DepthFirstInOrderIterator<TNodeInTree extends BinaryTreeNode<TNodeInTree> | null | undefined> implements Iterator<NodeWithMetadata<TNodeInTree>, undefined> {
    private readonly _traversalStack: Stack<{ node: TNodeInTree, hasGoneLeft: boolean, hasGoneRight: boolean }> = new Stack<{ node: TNodeInTree, hasGoneLeft: boolean, hasGoneRight: boolean }>();
    private readonly _ancestors: TNodeInTree[] = [];

    constructor(root: TNodeInTree) {
        this._traversalStack.push({ 
            node: root, 
            hasGoneLeft: false, 
            hasGoneRight: false 
        });
    }
    public next(): IteratorResult<NodeWithMetadata<TNodeInTree>, undefined> {
        let moved = false;
        while (this._traversalStack.length > 0 && (!this._traversalStack.peek()!.hasGoneLeft || !this._traversalStack.peek()!.hasGoneRight)) {
            while(!this._traversalStack.peek()!.hasGoneLeft) {
                if (!this._moveLeft()) { break; }
                moved = true;
            }
            
            if (moved && !this._traversalStack.peek()!.hasGoneRight) {
                return { 
                    done: false, 
                    value: new NodeWithMetadata(this._traversalStack.peek()!.node, this._ancestors) 
                };
            }
    
            if (!this._traversalStack.peek()!.hasGoneRight) {
                moved = this._moveRight();
            }

            if (!moved) {
                while (this._traversalStack.peek()?.hasGoneLeft && this._traversalStack.peek()?.hasGoneRight) {
                    this._traversalStack.pop();
                    this._ancestors.pop();
                    moved = true;
                }
            }
        }

        return {
            done: true, 
            value: undefined
        };
    }

    private _moveLeft(): boolean {
        this._traversalStack.peek()!.hasGoneLeft = true;
        
        let current = this._traversalStack.peek()!.node;
        let left = current?.getLeft();
        if (left) {
            if (current) {
                this._ancestors.push(current);
            }
            this._traversalStack.push({
                node: left,
                hasGoneLeft: false,
                hasGoneRight: false
            });
            return true;
        }

        return false;
    }

    private _moveRight(): boolean {
        this._traversalStack.peek()!.hasGoneRight = true;
        
        let current = this._traversalStack.peek()!.node;
        let right = current?.getRight();
        if (right) {
            if (current) {
                this._ancestors.push(current);
            }

            this._traversalStack.push({
                node: right,
                hasGoneLeft: false,
                hasGoneRight: false
            });

            return true;
        }

        return false;
    }
}